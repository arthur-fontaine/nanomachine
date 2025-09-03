import fs from "node:fs";
import path from "node:path";
import { getCallSites } from "node:util";
import { CallExpression, Identifier, Node, ObjectLiteralExpression, Project, type Symbol as TsMorphSymbol, SyntaxKind, VariableDeclaration, type SourceFile, FunctionExpression, ArrowFunction } from "ts-morph";
import type { StateMachine } from "../builder/99_state_machine.ts";
import { Graph } from "./Graph.ts";

export function createGraph(machine: StateMachine<any, any, any>) {
  const { file, line, column } = getCallerFile();
  const tsConfigPath = findTsConfig(path.dirname(file));

  const project = new Project({
    ...(tsConfigPath ? { tsConfigFilePath: tsConfigPath } : {}),
    skipAddingFilesFromTsConfig: false,
  });

  project.resolveSourceFileDependencies();

  const sourceFile = project.getSourceFile(file);
  if (!sourceFile) throw new Error(`Source file not found: ${file}`);

  const nodeFound = findCallerFunctionNode(sourceFile, line, column);

  const callExpression = nodeFound.getParentIfKindOrThrow(SyntaxKind.CallExpression);
  if (!callExpression) throw new Error('Call expression not found at the specified location');

  const machineNode = findMachineNode(callExpression);

  const machineStatesArg = machineNode.getArguments()[0];
  if (!ObjectLiteralExpression.isObjectLiteralExpression(machineStatesArg)) throw new Error('Machine states argument is not an object literal');

  const stateDeclarations = findStateDefinitions(machineStatesArg);

  const graph = new Graph();
  stateDeclarations.forEach(({ stateName, initializer }) => {
    graph.addNode(stateName);
    const returnType = initializer.getReturnType();

    const nextStatesType = returnType.getTypeArguments()[3];
    if (!nextStatesType) throw new Error(`Unable to determine next states type for state: ${stateName}`);

    const nextStates: string[] = [];

    if (nextStatesType.isUnion()) nextStatesType.getUnionTypes().forEach(t => nextStates.push(t.getText()));
    if (nextStatesType.isStringLiteral()) nextStates.push(nextStatesType.getLiteralValue() as string);

    nextStates.forEach(ns => {
      const text = ns.replace(/^["']|["']$/g, ''); // Remove quotes if string literal
      graph.addNode(text);
      graph.addEdge(stateName, text);
    });
  });

  console.log(graph.toMermaid());

  return graph;
}

function getCallerFile() {
  const callSites = getCallSites();

  if (callSites.length < 2) throw new Error('Unable to detect caller information');

  // Get the caller's call site (skip the current function)
  const fileName = typeof __filename === 'string' ? __filename : import.meta.filename;
  const callerSite = callSites.find(site => site.scriptName !== fileName && site.scriptName !== `file://${fileName}`);
  if (!callerSite) throw new Error('Unable to find caller information');

  const scriptName = callerSite.scriptName.replace(/^file:\/\//, '');
  const lineNumber = callerSite.lineNumber;
  const columnNumber = callerSite.columnNumber;

  return { file: scriptName, line: lineNumber, column: columnNumber };
}

function findTsConfig(startDir: string) {
  let currentDir = startDir;

  while (true) {
    const tsConfigPath = path.join(currentDir, 'tsconfig.json');
    if (fs.existsSync(tsConfigPath)) {
      return tsConfigPath;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break; // Reached the root directory
    }
    currentDir = parentDir;
  }
}

function findCallerFunctionNode(sourceFile: SourceFile, line: number, column: number) {
  let nodeFound: Identifier | undefined;
  sourceFile.forEachDescendant((node) => {
    const start = node.getStart();
    const end = node.getEnd();

    const startPos = sourceFile.getLineAndColumnAtPos(start);
    const endPos = sourceFile.getLineAndColumnAtPos(end);

    // Check if the line and column number fall within the node's range
    if (
      (startPos.line <= line && line <= endPos.line) &&
      (startPos.line < line || startPos.column <= column) &&
      (endPos.line > column || endPos.column >= column)
    ) {
      nodeFound = node as Identifier; // It automatically gets the last matching node, which is our function call
    }
  });

  if (!nodeFound) throw new Error('No matching node found at the specified location');

  return nodeFound;
}

function findMachineNode(callExpression: CallExpression) {
  const machineArg = callExpression.getArguments()[0];

  if (Identifier.isIdentifier(machineArg)) {
    const definitions = machineArg.getDefinitionNodes();
    if (definitions.length > 1) throw new Error('Multiple definitions found for the machine argument');
    if (definitions.length === 0) throw new Error('No definition found for the machine argument');

    const defNode = definitions[0];
    if (!VariableDeclaration.isVariableDeclaration(defNode)) throw new Error('Machine argument definition is not a variable declaration');

    const initializer = defNode.getInitializer();
    if (!initializer) throw new Error('Machine variable has no initializer');

    if (!CallExpression.isCallExpression(initializer)) throw new Error('Machine variable initializer is not a call expression');

    return initializer;
  }

  if (CallExpression.isCallExpression(machineArg)) return machineArg;

  throw new Error('Unsupported machine argument type');
}

function resolveFinalSymbol(sym?: TsMorphSymbol | null): TsMorphSymbol | undefined {
  if (!sym) return undefined;
  let cur: TsMorphSymbol | undefined = sym;
  while (cur?.isAlias?.()) {
    const next = cur.getAliasedSymbol();
    if (!next || next === cur) break;
    cur = next;
  }
  return cur;
}

function getValueSymbolFromProp(prop: Node) {
  if (Node.isShorthandPropertyAssignment(prop)) return prop.getValueSymbol();

  if (Node.isPropertyAssignment(prop)) {
    const init = prop.getInitializer();
    if (!init) return undefined;
    if (Node.isIdentifier(init)) return init.getSymbol();
    if (Node.isPropertyAccessExpression(init)) return init.getNameNode().getSymbol();
    return init.getType().getSymbol();
  }

  return undefined;
}

function getRealDeclarationsFromProp(prop: Node) {
  const valueSymbol = getValueSymbolFromProp(prop);
  const final = resolveFinalSymbol(valueSymbol);
  return final?.getDeclarations() ?? [];
}

function getNameFromProp(prop: Node) {
  if (Node.isShorthandPropertyAssignment(prop)) return prop.getName();

  if (Node.isPropertyAssignment(prop)) {
    const nameNode = prop.getNameNode();
    if (Node.isIdentifier(nameNode) || Node.isStringLiteral(nameNode) || Node.isNumericLiteral(nameNode)) {
      return nameNode.getText().replace(/^["']|["']$/g, ''); // Remove quotes if string literal
    }
    return nameNode.getText();
  }

  return undefined;
}

function findStateDefinitions(machineStatesArg: Node) {
  const statesObject = machineStatesArg.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
  return statesObject.getProperties().flatMap((prop) => {
    const decls = getRealDeclarationsFromProp(prop);
    if (decls.length === 0) throw new Error(`No real declarations resolved for state: ${prop.getText()}`);
    if (decls.length > 1) throw new Error(`Multiple declarations resolved for state: ${prop.getText()}`);

    const decl = decls[0]!;
    if (!VariableDeclaration.isVariableDeclaration(decl)) throw new Error(`State declaration is not a variable declaration: ${decl.getText()}`);

    const initializer = decl.getInitializer();
    if (!initializer) throw new Error(`State variable has no initializer: ${decl.getText()}`);

    if (
      !FunctionExpression.isFunctionExpression(initializer) &&
      !ArrowFunction.isArrowFunction(initializer)
    ) throw new Error(`State variable initializer is not a function expression: ${initializer.getText()}`);

    const propName = getNameFromProp(prop);
    if (!propName) throw new Error(`Unable to determine property name for state: ${prop.getText()}`);

    return { stateName: propName, initializer };
  });
}
