/* 
 * SVG curve example
 *
 * By Craig Buckler,		http://twitter.com/craigbuckler
 * of OptimalWorks.net		http://optimalworks.net/
 * for SitePoint.com		http://sitepoint.com/
 * 
 * Refer to:
 * http://www.sitepoint.com/html5-svg-quadratic-curves/
 * http://www.sitepoint.com/html5-svg-cubic-curves/
 *
 * This code can be used without restrictions.
 */

(function() {

	var num, container, cType, code, point = {}, line = [], fill = false, drag = null, dPoint, maxX, maxY;

	var svgNS = "http://www.w3.org/2000/svg";  
	var svg = document.getElementById("svg");
	var controls = document.getElementById("controls");
	var lines = document.getElementById("lines");
	var path = [];

	svg.addEventListener('dblclick',function(e){
		if(e.target===svg){
			createCircle(e);
		}else{
			var point = parseInt(e.target.getAttributeNS(null,"data-point"));
			if(point === 0){
				var group = parseInt(e.target.getAttributeNS(null,"data-group"));
				var p = path[group][0];
				p.c.outerHTML = "";
				delete p.c;
				if(group>0){
					p = path[group][1];
					p.c.outerHTML = "";
					p.l.outerHTML = "";
					delete p.c;
					delete p.l;
					p = path[group][2];
					p.c.outerHTML = "";
					p.l.outerHTML = "";
					delete p.c;
					delete p.l;
				}else if(path.length>1){
					p = path[1][1];
					p.c.outerHTML = "";
					p.l.outerHTML = "";
					delete p.c;
					delete p.l;
					p = path[1][2];
					p.c.outerHTML = "";
					p.l.outerHTML = "";
					delete p.c;
					delete p.l;
					path[1].splice(1, 2);
				}
				path.splice(group, 1);

				if(path.length>0){
					path[0][0].c.setAttributeNS(null, "data-group", 0);
				}
				for(var i=1,z=path.length; i<z;i++){
					path[i][0].c.setAttributeNS(null, "data-group", i);
					path[i][1].c.setAttributeNS(null, "data-group", i);
					path[i][2].c.setAttributeNS(null, "data-group", i);
				}
				DrawSVG();
			}
		}
	},false);

	function createPoint(x,y,s,g,p){
		point = {
			c:document.createElementNS(svgNS,"circle"),
			x:x,
			y:y
		};
		point.c.setAttributeNS(null,"class","draggable");
		point.c.setAttributeNS(null, "r", s);
		point.c.setAttributeNS(null, "cx", x);
		point.c.setAttributeNS(null, "cy", y);
		point.c.setAttributeNS(null, "data-group", g);
		point.c.setAttributeNS(null, "data-point", p);
		controls.appendChild(point.c);
		if(g>0){
			point.l = document.createElementNS(svgNS,"polyline");
			lines.appendChild(point.l);
		}
		return point;
	}

	function createCircle(e){
		var mouseX = Math.round(e.clientX - container.left);
		var mouseY = Math.round(e.clientY - container.top);
		var previousGroup = path[path.length-1];
		var currentGroup = path.length;
		var points = [];
		var currentPoint = 0;
		points.push(createPoint(mouseX,mouseY,16,currentGroup,currentPoint));
		if(typeof(previousGroup) != "undefined") {
			var previousPoint = previousGroup[0];
			currentPoint++;
			points.push(createPoint(previousPoint.x,previousPoint.y,8,currentGroup,currentPoint));
			currentPoint++;
			points.push(createPoint(mouseX,mouseY,8,currentGroup,currentPoint));
		}
		path.push(points);

		DrawSVG();
	}

	// define initial points
	function Init() {

		var c = svg.getElementsByTagName("circle");
		for (var i = 0; i < c.length; i++) {
			point[c[i].getAttributeNS(null,"id")] = {
				x: parseInt(c[i].getAttributeNS(null,"cx"),10),
				y: parseInt(c[i].getAttributeNS(null,"cy"),10)
			};
		}
		
		// lines
		line.push(svg.getElementById("curve"));
		line.push(svg.getElementById("l1"));
		line.push(svg.getElementById("l2"));
		
		// code
		code = document.getElementById("code");

	
		// event handlers
		svg.onmousedown = svg.onmousemove = svg.onmouseup = Drag;
		svg.ontouchstart = svg.ontouchmove = svg.ontouchend = Drag;
		
		DrawSVG();
	}
	
	
	// draw curve
	function DrawSVG() {
		var d ="";
		if(typeof(path[0]) != "undefined") {
			d = "M"+path[0][0].x+","+path[0][0].y;
			for(var i=1,z=path.length; i<z;i++){
				p=path[i];
				p1=path[i-1];
				p[1].l.setAttributeNS(null, "points", p1[0].x+","+p1[0].y+" "+p[1].x+","+p[1].y);
				p[2].l.setAttributeNS(null, "points", p[0].x+","+p[0].y+" "+p[2].x+","+p[2].y);
				d += " C"+p[1].x+","+p[1].y+" "+p[2].x+","+p[2].y+" "+p[0].x+","+p[0].y;
			}
		}

		// curve
		d += (fill ? " Z" : "");

		line[0].setAttributeNS(null, "d", d);
		
		// show code
		if (code) {
			code.textContent = '<path d="'+d+'" />';
		}
	}
	
	
	// drag event handler
	function Drag(e) {
		e.stopPropagation();
		var t = e.target, id = t.id, et = e.type, group = t.getAttributeNS(null,"data-group");

		// toggle fill class
		if (!drag && et == "mousedown" && id == "curve") {
			fill = !fill;
			t.setAttributeNS(null, "class", (fill ? "fill" : ""));
			DrawSVG();
		}
	
		// start drag
		if (!drag && typeof(path[group]) != "undefined" && (et == "mousedown" || et == "touchstart")) {
			drag = e;
			m = MousePos(e);
			var point = parseInt(drag.target.getAttributeNS(null,"data-point"));
			var group = parseInt(drag.target.getAttributeNS(null,"data-group"));
			if(drag.ctrlKey){
				if(point === 0){
					if(group>0){
						var p = path[group][2];
						p.bx = path[group][point].x - p.x;
						p.by = path[group][point].y - p.y;
					}
					if(typeof(path[group+1]) != "undefined"){
						var p = path[group+1][1];
						p.bx = path[group][point].x - p.x;
						p.by = path[group][point].y - p.y;
					}
				}
			}
		}
		
		// drag
		if (drag && (et == "mousemove" || et == "touchmove")) {
			m = MousePos(e);
			var point = parseInt(drag.target.getAttributeNS(null,"data-point"));
			var group = parseInt(drag.target.getAttributeNS(null,"data-group"));

			var p = path[group][point];
			p.x = m.x;
			p.y = m.y;
			p.c.setAttributeNS(null, "cx", p.x);
			p.c.setAttributeNS(null, "cy", p.y);

			if(drag.ctrlKey){
				if(point === 0){
					if(group>0){
						p = path[group][2];
						p.x = path[group][point].x - p.bx;
						p.y = path[group][point].y - p.by;
						p.c.setAttributeNS(null, "cx", p.x);
						p.c.setAttributeNS(null, "cy", p.y);
					}
					if(typeof(path[group+1]) != "undefined"){
						p = path[group+1][1];
						p.x = path[group][point].x - p.bx;
						p.y = path[group][point].y - p.by;
						p.c.setAttributeNS(null, "cx", p.x);
						p.c.setAttributeNS(null, "cy", p.y);
					}
				}
			}
			DrawSVG();
		}

		// stop drag
		if (drag && (et == "mouseup" || et == "touchend")) {
			drag = null;
		}
	
	}

	// mouse position
	function MousePos(e) {
		return {
			x: Math.max(0, Math.min(maxX, Math.round(e.clientX - container.left))),
			y: Math.max(0, Math.min(maxY, Math.round(e.clientY - container.top)))
		}
	}

	// start
	window.onload = function() {
		container = svg.getBoundingClientRect();
		maxX = container.width;
		maxY = container.height;
		Init();

	}

	window.onscroll = function() {
		container = svg.getBoundingClientRect();
		maxX = container.width;
		maxY = container.height;
	};
})();

 



