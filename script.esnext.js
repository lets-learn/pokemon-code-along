'use strict'
const fetchOptions = {
	headers: {
		'Content-Type': 'application/json'
	},
	mode: 'cors'
};
$('form').on('submit', function(e) {
	e.preventDefault();

	let types = $('input[type=text]').val().replace(/\s/g,'');
	types = types.split(',');
	console.log(types);

	let trainerTypeCalls = types.map(elem => {
		return fetch(`http://pokeapi.co/api/v2/type/${elem}/`, fetchOptions);
	});


	getPromiseData(trainerTypeCalls)
		.then(res => {
			console.log(res);
			getDoubleDamagePokemon(res);
		});

});

function getPromiseData(promises) {
	return new Promise((resolve,reject) => {
		Promise.all(promises)
			.then(res => {
				return res.map( type => type.json())
			})
			.then((res) => {
				Promise.all(res)
					.then(resolve);
			})
			.catch(reject);
	});
}

function getDoubleDamagePokemon(types) {
	let doubleDamage = types.map((type) => {
		return type.damage_relations.double_damage_from;
	})
	.reduce(flatten,[])
	.map( type => {
		return fetch(type.url,fetchOptions);
	});

	getPromiseData(doubleDamage)
		.then((pokemon) => {
			pokemon = pokemon.map( poke => poke.pokemon)
				.reduce(flatten, [])
				.map( poke => poke.pokemon );

			buildPokemon(pokemon);

		});
}

function buildPokemon(ogPokemon) {
	let team = [];
	console.log(ogPokemon);
	for(let i = 0; i < 6; i++) {
		team.push( getRandomPokemon(ogPokemon) );
	}
	var teamCalls = team.map( pokemon => {
		return fetch(pokemon.url, fetchOptions);
	});

	getPromiseData(teamCalls)
		.then( res => {
			displayPokemon(res);
		});
}


// A function to return a random pokemon
function getRandomPokemon(pokemonArray) {
	//using Math.floor and Math.random we can return a random pokemon
	var randomIndex = Math.floor(Math.random() * pokemonArray.length);
	// Return just the pokemon!
	return  pokemonArray[ randomIndex ];
}

function displayPokemon(pokemon) {
	// loop through and display the pokemon!
	pokemon.forEach( poke => {
		var $container = $('<div>').addClass('pokemon');
		var $image = $('<img>').attr('src',`http://pokeapi.co/media/img/${poke.id}.png`);
		var $title = $('<h2>').text(poke.name);
		$container.append($image,$title);
		$('.poke-container').append($container);
	});
}

let flatten = (a,b) => [...a,...b];












	