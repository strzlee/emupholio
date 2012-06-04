// Emupholio
// backend.js
// version 1.00
// (c) 2012 Manuel Strauss
// straussn.eu

$(function(){

	var emuBackend = {
		data: [],
		imagesTemp: [],
		selected: undefined,
		domElements : {},
		jcrop_api: undefined,
		thumbData: {
			x: 0,
			y: 0,
			w: 0,
			h: 0,
			targ_w: 200,
			targ_h: 200
		},
		
		init: function() {
			this.loadDomElements();
			this.checkLogin();
		},
		
		run: function() {
			this.initJcrop();
			this.getImageList();
			this.eventHandlerInit();
		},
		
		loadDomElements: function() {
			this.domElements.$body = $("body");
			this.domElements.$overlay = $("#overlay");
			this.domElements.$infoBox = $("#infobox");
			this.domElements.$imageList = $("#imagelist");
			this.domElements.$cropBox = $("#cropbox");
			this.domElements.$sizeBtn = $("#size-btn");
			this.domElements.$thumbBtn = $("#thumb-btn");
			this.domElements.$delThumbBtn = $("#del_thumb-btn");
			this.domElements.$delImgBtn = $("#del_img-btn");
			this.domElements.$uploadBtn = $("#upload-btn");
			this.domElements.$logoutBtn = $("#logout-btn");
			this.domElements.$uploadStatus = $("#upload-status");
			this.domElements.$uploadFrame = $("#upload-frame");
			this.domElements.$metaData = $("#meta-data");
		},
		
		initJcrop: function() {
			var self = this;
			
			this.domElements.$cropBox.Jcrop({aspectRatio: 1, onSelect: function(c) {self.updateCoords(c);}, boxWidth: 410, boxHeight: 360}, 
				function(){ self.jcrop_api = this;}
			);
		},
		
		storeData: function(data) {
			this.data = data.splice(0);	
		},

		getImageList: function() {
			var self = this;
			$.getJSON("controller.php",{action: "getList"}, function(response) {
				self.storeData(response);
				self.updateImageList();
			});
		},
		
		preLoadImages: function() {
			for (var i = 0; i < this.data.length; i++) {
				this.imagesTemp[i] = new Image();
				this.imagesTemp[i].src = this.data[i].file;
			}
		},
		
		selectImage: function(id) {
			this.selected = id;
			this.jcrop_api.setImage(this.data[this.selected].file);
		},
		
		updateImageList: function() {
			var style = "";
			var html = "";
			for(var i=0; i < this.data.length; i++) {	
				if (this.data[i].thumb) style = "list-element";
				else style = "list-element no-thumb";
				html += "<li class='"+style+"' title='"+i+"'>"+this.data[i].name+"</li>";
			}
			this.domElements.$imageList.html(html);
			this.domElements.$metaData.text("Number of images: "+this.data.length);
			this.preLoadImages();
		},
		
		release: function() {
			this.getImageList();
			this.selected = undefined;
			this.jcrop_api.setImage("./img/empty.jpg");
		},
		
		deleteFile: function(file) {
			var self = this;
			$.getJSON("controller.php?action=delete", {"file": file}, function(resp) {
				if (resp) {
					self.showInfo("File deleted");
					self.release();
				}
			});
		},
		
		setThumbnail: function(id, thumb) {
			this.data[id].thumb = thumb;
			this.updateImageList();
		},
		
		showInfo: function(info) {
			var box = this.domElements.$infoBox.text(info).show("slow");
			setTimeout(function(){
				box.hide("slow");
			}, 3000);
		},
		
		drawOverlay: function() {
			var w = $(document).width();
			var h = $(window).height();
			this.domElements.$overlay.width(w).height(h).show();
		},
		
		removeOverlay: function() {
			this.domElements.$overlay.hide();
		},
		
		checkLogin: function() {
			var self = this;
			$.getJSON("controller.php", {"action": "userCheck"}, function(resp) {
				if (resp) {
					self.showInfo("Login successful");
					self.run();
				} else self.showLogin();
			});
		},
		
		showLogin: function() {
			this.drawOverlay();
			var left = ($(document).width() / 2) - 100;
			var top = ($(window).height() / 2) - 100;
			this.domElements.$body.prepend("<form id='login-form' action='controller.php?action=login' method='POST'><input type='text' name='user' value='User'/><input type='password' name='pass' value='Password' /><button type=submit>Submit</button></form>");
			$("#login-form").offset({"top": top, "left": left});
		},
		
		updateCoords: function(c) {
			this.thumbData.x = c.x;
			this.thumbData.y = c.y;
			this.thumbData.w = c.w;
			this.thumbData.h = c.h;
		},
		
		checkCoords: function() {
			if (parseInt(this.thumbData.w)) return true;
			showInfo("No Crop-Area seletced");
			return false;
		},
		
		eventHandlerInit: function() {
			var self = this;
			
			//ImageList Element Pick
			this.domElements.$imageList.click(function(e) {
				var $target = $(e.target);
				if ($target.hasClass("list-element")) self.selectImage($target.attr("title"));	
			});	
			
			//Change Crop Box Ratio Button
			this.domElements.$sizeBtn.click(function(e) { 
				if (self.thumbData.targ_w == 200) {
					self.thumbData.targ_w = 410;
					self.jcrop_api.setOptions({aspectRatio: 410/200});
					self.domElements.$sizeBtn.text("Size: Double");
				} else {
					self.thumbData.targ_w = 200;
					self.jcrop_api.setOptions({aspectRatio: 1});
					self.domElements.$sizeBtn.text("Size: Standart");	
				}
				self.selectImage(self.selected);
				self.jcrop_api.release();
			});
			
			//Create Thumbnail Button
			this.domElements.$thumbBtn.click(function(e) {
				if (self.checkCoords() && self.selected != undefined) {
					var request = $.extend(self.thumbData, self.data[self.selected]);
					$.getJSON("controller.php?action=crop", request ,function(resp) {
						if(resp) {
							self.showInfo("Tumbnail created");
							self.setThumbnail(self.selected, true);
							self.jcrop_api.release();
						} else self.showInfo("Tumbnail failure");
					});
				} else {
					self.showInfo("No image selected");
				}
			});
			
			//Delete Thumbnail Button
			this.domElements.$delThumbBtn.click(function(e) {
				if (self.selected != undefined) self.deleteFile(self.data[self.selected].thumb);
				else self.showInfo("No image selected");
			});			
			
			//Delete Image Button
			this.domElements.$delImgBtn.click(function(e) {
				if (self.selected != undefined) self.deleteFile(self.data[self.selected].file);
				else self.showInfo("No image selected");
			});
			
			//Upload Button
			this.domElements.$uploadBtn.click(function(e) {
				self.domElements.$uploadStatus.html("<p>Uploading, please wait...</p><img src='img/load.gif' alt='loading' />");
			}); 
			
			//When Hidden Upload Frame Loaded -> Copy Content To Upload Status 
			this.domElements.$uploadFrame.load(function() {
				self.showInfo("Uploading done...");
				self.getImageList();
				setTimeout(function(){
					var status = $(document.getElementById("upload-frame").contentWindow.document).find("body").html();
					self.domElements.$uploadStatus.html(status);
				}, 1000);
			});
			
			//Logout Button
			this.domElements.$logoutBtn.click(function() {
				$.getJSON("controller.php", {"action": "logout"}, function(resp) {
					if (resp) window.location.reload();
				});
			});
		}
	}
	
	emuBackend.init();	

});