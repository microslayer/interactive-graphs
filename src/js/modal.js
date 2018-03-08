// represents the modal UI 

class g_modal {
	constructor(title, text) {
		this.title = title; 
		this.text = text; 
		this.wrapper = this.createModal(title, text)[0]; 
	}

	showModal() {
		this.wrapper.style.display = 'block'; 
	}

	hideModal(wrapper) {
		if (wrapper)
			wrapper.style.display = 'none'; 
		else 
			this.wrapper.style.display = 'none'; 
	}

	createModal(title, text, footer) {
		if (!title)
			title = ""; 
		if (!text)
			text = ""; 
		if (!footer)
			footer = ""; 

		var elm = $(
			`<div id="myModal" class="modal">
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


}