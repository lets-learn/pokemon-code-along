$('form').on('submit', function(e) {
	e.preventDefault();

	var types = $('input[type=text]').val().replace(/\s/g,'');
	types = types.split(',');
	console.log(types);
	var trainerTypes = types.map(function(type) {
		return $.ajax({
			url: 'http://pokeapi.co/api/v2/type/' + type,
			dataType: 'json',
			method: 'GET'
		});
	});

	$.when.apply(null,trainerTypes)
		.then(function() {
			var pokemonTypes = Array.prototype.slice.call(arguments);
			getDoubleDmgTypes(pokemonTypes);
		});
});

function getDoubleDmgTypes(pokemonTypes) {
	pokemonTypes = pokemonTypes.map(function(types) {
		return types[0].damage_relations.double_damage_from;
	});
	pokemonTypes = flatten(pokemonTypes);

	var damageTypes = pokemonTypes.map(function(type) {
		return $.ajax({
			url: type.url,
			dataType: 'json',
			method: 'GET'
		});
	});

	$.when.apply(null,damageTypes)
		.then(function() {
			var pokemon = Array.prototype.slice.call(arguments);

			buildTeam(pokemon);
		});

}

function buildTeam(pokemon) {
	pokemon = pokemon.map(function(poke) {
		return poke[0].pokemon;
	});

	pokemon = flatten(pokemon);
	var team = [];

	for(var i = 0; i < 6; i++) {
		team.push( getRandomPokemon(pokemon) );
	}

	team = team.map(function(pokemon) {
		return $.ajax({
			url: pokemon.pokemon.url,
			dataType: 'json',
			methd: 'GET'
		});
	});

	$.when.apply(null,team)
		.then(function() {
			var pokemonTeam = Array.prototype.slice.call(arguments);
			pokemonTeam = pokemonTeam.map(function(poke) {
				return poke[0];
			});

			displayPokemon(pokemonTeam);
		});

}

function displayPokemon(pokemon) {
	// loop through and display the pokemon!
	pokemon.forEach(function(poke) {
		var $container = $('<div>').addClass('pokemon');
		var $image = $('<img>').attr('src','http://pokeapi.co/media/img/'+poke.id+'.png');
		var $title = $('<h2>').text(poke.name);
		$container.append($image,$title);
		$('.poke-container').append($container);
	});
}


function getRandomPokemon(pokemonArray) {
	var index = Math.floor(Math.random() * pokemonArray.length);
	return pokemonArray[index];

}


function flatten(arrayToFlatten) {
	return arrayToFlatten.reduce(function(a,b) {
		return a.concat(b);
	},[]);
}












