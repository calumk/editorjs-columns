let example_data = {
	blocks: [
		{
			type: "header",
			data: {
				text: "Example : @calumk/editorjs-columns ",
				level: 3,
			},
		},
		{
			type: "paragraph",
			data: {
				text: "This is an example of using EditorJs, with the @calumk/editorjs-columns package",
			},
		},
		{
			type: "delimiter",
		},
		{
            "type" : "columns",
            "data" : {
                "col0" : {
                    "blocks" : [
                        {
                            "type" : "header",
                            "data" : {
                                "text" : "Col 1",
                                "level" : 4
                            }
                        },
                        {
                            "type" : "paragraph",
                            "data" : {
                                "text" : "This is Column 1"
                            }
                        }
                    ],
                },
                "col1" : {
                    "blocks" : [
                        {
                            "type" : "header",
                            "data" : {
                                "text" : "Col 2",
                                "level" : 3
                            }
                        },
                        {

                            "type" : "paragraph",
                            "data" : {
                                "text" : "This is Column 2"
                            }
                        }
                    ],
                }
            }
        }
	],
};
