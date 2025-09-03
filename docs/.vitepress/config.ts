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
					{ text: "Getting Started", link: "/getting-started" },
					{ text: "Overview", link: "/overview" },
				],
			},
			{
				text: "Usage",
				items: [
					{ text: "Context", link: "/usage/context" },
					{ text: "Events", link: "/usage/events" },
					{ text: "States", link: "/usage/states" },
					{ text: "Initial", link: "/usage/initial" },
					{
						text: "Implement",
						link: "/usage/implement",
						items: [
							{ text: "guard", link: "/usage/implement#guard" },
							{ text: "guardContext", link: "/usage/implement#guardcontext" },
							{ text: "localEvent", link: "/usage/implement#localevent" },
							{ text: "onEntry", link: "/usage/implement#onentry" },
							{ text: "onReceive", link: "/usage/implement#onreceive" },
							{ text: "after", link: "/usage/implement#after" },
						],
					},
					{ text: "State Machine", link: "/usage/state-machine" },
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
