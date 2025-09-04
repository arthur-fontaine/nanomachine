import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "Nanomachine",
	description: "A fully-typed and modular state machine builder.",
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Examples", link: "/examples" },
		],

		sidebar: [
			{
				text: "Introduction",
				items: [
					{
						text: "Why Nanomachine?",
						link: "/why-nanomachine",
						items: [
							{ text: "Comparison with XState", link: "/why-nanomachine#xstate" },
						],
					},
					{
						text: "Getting Started",
						link: "/getting-started",
						items: [
							{ text: "Installation", link: "/getting-started#installation" },
							{ text: "Overview", link: "/getting-started#overview" },
						],
					},
				],
			},
			{
				text: "Usage",
				items: [
					{ text: "Create a State Machine", link: "/usage/create-state-machine" },
					{ text: "Implement States", link: "/usage/implement-states" },
					{ text: "Graph", link: "/usage/graph" },
				],
			},
			{
				text: "Tips & Tricks",
				items: [
					{ text: "File Split", link: "/tips/file-split" },
					{ text: "Type Inference", link: "/tips/type-inference" },
				],
			},
			{
				text: "Examples",
				items: [
					{ text: "Authentication", link: "/examples/authentication" },
				],
			},
		],

		socialLinks: [
			{ icon: "github", link: "https://github.com/arthur-fontaine/nanomachine" },
			{ icon: "x", link: "https://x.com/voithure" },
		],
	},
});
