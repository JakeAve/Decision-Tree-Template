const data = {
	"dids" : [
		{"did" : "1", "content" : "Do you want to help test this?", "responses" : ["Yes!", "No!", "Maybe"], "children" : ["9", "10", "11"], "parent": null},
		{"did" : "9", "content" : "Thanks! Just choose your favorite color.", "responses" : ["Red", "Blue", "Green", "Other"], "children" : ["12", "13", "14", "15"], "parent": "1"},
		{"did" : "10", "content" : "Well then, your test is over! ", "responses" : null, "children" : null, "parent": "1"},
		{"did" : "11", "content" : "You should be more decisive. Do you want to help test this?!", "responses" : ["Yes!!", "I hate it already", "You scared me"], "children" : ["16", "17", "18"], "parent": "1"},
		{"did" : "12", "content" : "That is the color or of love... or death ", "responses" : null, "children" : null, "parent": "9"},
		{"did" : "13", "content" : "Blue is the color of the sea or the sky, unless they are not blue. ", "responses" : null, "children" : null, "parent": "9"},
		{"did" : "14", "content" : "That is the color of nature and envy. Congrats.", "responses" : null, "children" : null, "parent": "9"},
		{"did" : "15", "content" : "You are picky. It's just a test.", "responses" : null, "children" : null, "parent": "9"},
		{"did" : "16", "content" : "You already did! :)", "responses" : null, "children" : null, "parent": "11"},
		{"did" : "17", "content" : "I'm sorry. Your test is over.", "responses" : null, "children" : null, "parent": "11"},
		{"did" : "18", "content" : "You scared me more.", "responses" : null, "children" : null, "parent": "11"} 
]};