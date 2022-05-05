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
                "cols" : [
                    {
                        "blocks" : [
                            {
              
                                "type" : "paragraph",
                                "data" : {
                                    "text" : "Hello World"
                                }
                            }
                        ],
                    
                    },
                    {
                        "blocks" : [
                            {     
                                "type" : "paragraph",
                                "data" : {
                                    "text" : "ABCDEF"
                                }
                            }
                        ],
                   
                    }
                ]
            }
        }
	],
};
