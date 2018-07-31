$(function(){
	if(!('getContext' in document.createElement('canvas'))){
		alert('Tu navegador no soporta canvas');
		return false;
	}

	var url = document.URL;

	var documento = $(document),
		canvas = $('#lienzo'),
		contexto = canvas[0].getContext('2d');

	var id = Math.round($.now()*Math.random());
	var click = false;
	var clientes = {};
	var cursores = {};
	var anterior = {};
	var ultimaemision = $.now();

	var socket = io.connect(url);

	socket.on('moving', function (datos) {
		if(! (datos.id in clientes)){
			cursores[datos.id] = $('<div class="cursor">').appendTo('#cursores');
		}

		cursores[datos.id].css({
			'left' : datos.x,
			'top' : datos.y
		});

		if(datos.click && clientes[datos.id]){
			dibujalinea(clientes[datos.id].x, clientes[datos.id].y, datos.x, datos.y);
		}

		clientes[datos.id] = datos;
		clientes[datos.id].actualizado = $.now();
	});


	canvas.on('mousedown',function(e){
		e.preventDefault();
		click = true;
		anterior.x = e.pageX;
		anterior.y = e.pageY;

	});

	documento.bind('mouseup mouseleave',function(){
		click = false;
	});


	documento.on('mousemove',function(evento){
		if($.now() - ultimaemision > 20){
			socket.emit('mousemove',{
				'x': evento.pageX,
				'y': evento.pageY,
				'click': click,
				'id': id
			});
			ultimaemision = $.now();
		}

		if(click){
			dibujalinea(anterior.x, anterior.y, evento.pageX, evento.pageY);

			anterior.x = evento.pageX;
			anterior.y = evento.pageY;
		}
	});

	setInterval(function(){
		for(identidad in clientes){
			if($.now() - clientes[identidad].actualizado > 10000){
				cursores[identidad].remove();
				delete clientes[identidad];
				delete cursores[identidad];
			}
		}
	},10000);

	function dibujalinea(desdex, desdey, haciax, haciay){
		contexto.moveTo(desdex, desdey);
		contexto.strokeStyle = '#F00'
		contexto.lineTo(haciax, haciay);
		contexto.stroke();
	}
});