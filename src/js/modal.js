// represents a modal UI 

class g_modal {
	constructor(id, title, text) {
		this.id = id; 
		this.title = title; 
		this.text = text; 
		this.footer = ''; 
		this.wrapper = this.createModal(id, title, text, this.footer)[0]; // html of modal 
	}

	showModal() {
		this.wrapper.style.display = 'block'; 
	}

	hideModal() {
		$(this.wrapper).fadeOut('fast'); 
	}

	createModal(id, title, text, footer) {
		if (!id) 
			id = ""; 
		if (!title)
			title = ""; 
		if (!text)
			text = ""; 
		if (!footer)
			footer = ""; 

		var elm = $(
			`<div id="${id}" class="modal">
			<div class="modal-content">
			<div class="modal-header">
			<span class="close">&times;</span>
			<h2>${title}</h2>
			</div>
			<div class="modal-body">
			<p>${text}</p>
			</div>
			<div class="modal-footer">
			<h3>${footer}</h3>
			</div>
			</div>
			</div>`
		); 

		elm[0].getElementsByClassName('close')[0].onclick = function() { 
			elm.fadeOut('fast'); 
		};

		return elm; 
	}

	editTitle(newTitle) {
		if (!newTitle)
			newTitle = ""; 
		this.title = newTitle; 
		$(this.wrapper).find("h2").text(newTitle); 
	}

	appendToBody(html) {
		var elm = $(this.wrapper); 
		var body = elm.find(".modal-body"); 
		body.append(html); 
	}

}