// Emupholio
// emupholio.js
// version 1.1
// (c) 2012 Manuel Strauss
// straussn.eu

(function() {
    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
    po.src = 'https://apis.google.com/js/plusone.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
})();

$(function(){
	
	var emupholio = {
		data: [],
		exifData: [],
		imagesTemp: [],
		domElements: {},
		selected: -1,
		
		init: function() {
			this.loadDomElements();
			this.getImageList();
			this.eventHandlerInit();
		},
		
		checkUrl: function() {
			if (window.location.hash.length > 1) {
				var id = this.findId(window.location.hash.slice(1));
				if (id > -1) this.showImageViewer(id);
			}
		},
		
		findId: function(img) {
			for (var i = 0; i < this.data.length; i++) {
				if (this.data[i].name == img) return i;
			}
		},
		
		setUrl: function() {
			if (this.selected < 0) window.location.hash = "";	
			else window.location.hash = "#"+this.data[this.selected].name;
		},
		
		loadDomElements: function() {
			this.domElements.$body = $("body");
			this.domElements.$container = $("#container");
			this.domElements.$grid = $("#grid");
			this.domElements.$overlay = $("#overlay");
			this.domElements.$imageViewer = $("#image-viewer");
			this.domElements.$imageViewerInfoBox = $("#image-viewer-info-box");
			this.domElements.$boxOverlay = $("#box-overlay");
		},
		
		preLoadImages: function() {
			for (var i = 0; i < this.data.length; i++) {
				this.imagesTemp[i] = new Image();
				this.imagesTemp[i].src = this.data[i].file;
			}
		},
		
		storeData: function(data) {	
			for (var i = 0, j = 0; i < data.length; i++) {
				if (data[i].thumb) {
					this.data[j] = data[i];
					j++;
				}
			}
		},
		
		storeExifData: function(id, data) {
			this.exifData[id] = $.extend({}, data);
			this.drawImageViewerInfoBox(id);
		},
		
		getImageList: function() {
			var self = this;
			$.getJSON("controller.php", {action: "getList"}, function(response){
				self.storeData(response);
				self.update(self.data);
				self.checkUrl();
			});
		},
		
		readExif: function(id) {
			var self = this;
			$.getJSON("controller.php?action=readExif", {"file": self.data[id].name}, function(resp) {
				self.storeExifData(id, resp);	
			});
		},
		
		update: function(data) {
			var style = "",
				html = "";
			for(var i=0; i < this.data.length; i++) {	
					if (this.data[i].thumbsize == 200) style = "box yellow";
					else style = "box yellow double";
					html += "<div class='"+style+"' name='"+i+"' style='background-image: url("+this.data[i].thumb+");'></div>"; //title
			}
			this.domElements.$grid.html(html);
			this.preLoadImages();
		},
		
		showImageViewer: function(id) {
			this.selected = id;
			this.domElements.$imageViewer.html("<img src='"+this.data[id].file+"' />");
			this.rescaleImageViewer();
			this.drawOverlay();
			this.drawImageViewerInfoBox(id);
			this.domElements.$imageViewer.show();
			this.setUrl();
		},
		
		removeImageViewer: function() {
			this.removeOverlay();
			this.domElements.$imageViewer.hide()
			this.domElements.$imageViewerInfoBox.hide();
			this.selected = -1;
			this.setUrl();
		},
		
		rescaleImageViewer: function() {
			var imageHeight = this.data[this.selected].height,
				imageWidth = this.data[this.selected].width,
				windowHeight = $(window).height(),
				windowWidth = $(document).width(),
				imageScale = {},
				aspectRatio = 1;
			
			if (imageHeight > (windowHeight - 100)) imageHeight = windowHeight - 100;
			if (imageWidth > (windowWidth - 100)) imageWidth = windowWidth - 100;
			
			var top = (windowHeight / 2) - (imageHeight / 2),
				left = (windowWidth / 2) - (imageWidth / 2);
				
			if (imageHeight > imageWidth) imageScale = {"height": imageHeight, "width": "auto"};
			else imageScale = {"height": "auto", "width": imageWidth};
			
			this.rescaleOverlay(); 
			this.domElements.$imageViewer.css({"top": top, "left": left})
				.children("img").css(imageScale);
		},
		
		browseImageViewer: function(dir) {
			var nextId;
			if (dir == "next") {
				if(parseInt(this.selected) < this.data.length - 1) nextId = parseInt(this.selected) + 1;
				else nextId = 0;
			} else if (dir == "prev") {
				if(parseInt(this.selected) > 0) nextId = parseInt(this.selected) - 1;
				else nextId = this.data.length - 1;
			}	
			this.domElements.$imageViewer.hide().html("");
			this.showImageViewer(nextId);	
		},
		
		drawImageViewerInfoBox: function(id) {
			if (this.exifData[id] != undefined) {
				//console.log(this.exifData);
				this.domElements.$imageViewerInfoBox.html("<p class='exif-data'>"+
														" "+this.exifData[id].FileName+
														" "+this.exifData[id].Model+
														" "+this.exifData[id].ExposureTime+
														" "+this.exifData[id].COMPUTED.ApertureFNumber+
														" "+this.exifData[id]["UndefinedTag:0xA434"]+
														"</p>"+
														"<a title='Share on Facebook' target='_new' href='http://www.facebook.com/sharer.php?u="+window.location+"&t=Emupholio "+this.exifData[id].FileName+"'><img src='img/facebook.png' class='social-icon'/></a>"+
														"<a title='Share on Twitter' target='_new' href='http://twitter.com/home?status="+window.location+"'><img src='img/twitter.png' class='social-icon'/></a>"+
														"<a title='E-Mail' href='mailto:?subject=I wanted you to see this site&amp;body=Check out this site"+window.location+"'><img src='img/mail.png' class='social-icon'/></a>"
														).show();
			}
			else this.readExif(id);
		},
		
		drawOverlay: function() {
			this.domElements.$overlay.show();
		},
		
		rescaleOverlay: function() {
			var w = $(window).width(),
				h = $(document).height();
			this.domElements.$overlay.width(w).height(h);
		},
		
		removeOverlay: function() {
			this.domElements.$overlay.hide();
		},
		
		eventHandlerInit: function() {
			var self = this;
			
			this.domElements.$grid.click(function(e) {
				var target = $(e.target);
				if (target.hasClass("box")) {
					self.showImageViewer(target.attr("name")); //title	
				}
			});
			
			this.domElements.$grid.mousemove(function(e) {
				var target = $(e.target);
				if (target.hasClass("box")) {
					if (target.html() == "") self.domElements.$boxOverlay.html("<p>"+self.data[target.attr("name")].name+"</p>").prependTo(target).show(); //title		
				} 	else self.domElements.$boxOverlay.show();
			});
			
			this.domElements.$grid.mouseleave(function(e) {
				self.domElements.$boxOverlay.hide().appendTo(self.domElements.$body);
			});
			
			this.domElements.$overlay.click(function(e) {
				self.removeImageViewer();
			});
			
			$(document).resize(function() {
				if (self.domElements.$imageViewer.is(":visible")) self.rescaleImageViewer();
			});
			
			$(window).resize(function() {
				if (self.domElements.$imageViewer.is(":visible")) self.rescaleImageViewer();
			});
			
			$(document).keydown(function(e) {
				if (self.domElements.$imageViewer.is(":visible")) {
					e.preventDefault();
					if (e.which == 37) self.browseImageViewer("prev");
					if (e.which == 39) self.browseImageViewer("next");
					if (e.which == 27) self.removeImageViewer(); //esc
				}
			});
		}
	}
	
	emupholio.init();
});