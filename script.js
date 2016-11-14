$('form').on('submit', function(e) {
	e.preventDefault();

	var types = $('input[type=text]').val().replace(' ','');
	types = types.split(',');

	// Call the API for the types
	// Based of the types we need to make an array of ajax calls
	// The call will get the type and stats on pokemon that are weak or 
	// super effective towards it
	var trainerTypeCalls = types.map(function(elem) {
		return $.ajax({
			url: 'http://pokeapi.co/api/v2/type/' + elem,
			dataType: 'json'
		});
	})

	// With this array of ajax calls, we need to wait till they come back.
	// We can use $.when for this, however that method does not accept an array
	// We have to pass them in one at a time.
	// There is a method on all functions called .apply ( http://ryanchristiani.com/call-and-apply-for-beginners/ ) 
	// that will take an array of elements and spread them out over the function and call it as if
	// we passed them one at a time. 
	$.when.apply(null, trainerTypeCalls)
		.then(function() {
			// There is one other issue here. If we don't know the number of arguments we passed to $.when
			// So how can we figure out how many arguments are passed to .then()
			// Inside of each function there is a special keyword called arguments
			// arguments is an array LIKE value of all the arguments passed.
			// So this will be an array of the type data we need. However we only want the
			// double_damage_from array of pokemon.
			// SO using .apply again we can do this little trick.
			// We can use the slice method on the Array.prototype to make our
			// array LIKE arguments value an actual array. 
			// The line below will convert our arguments to be an actual array!
			var types = Array.prototype.slice.apply(arguments);
			//Using .map we want to create a new array of ONLY the double damage pokemon.
			types = types.map(function(type) {
				return type[0].damage_relations.double_damage_from;
			});
			// HOWEVER! That new array is an array of arrays...not cool
			// We can use a techinque called flattening, to take the inner array and move them out!
			// Read the comments in the flatten function at the bottom to see how it works!
			types = flatten(types);
			// Pass this along, we are done with this function. 
			getDoubleDamagePokemon(types);
		});
});


// This function will take our types and get the pokemon for them.
function getDoubleDamagePokemon(types) {
	// Similar to the above trainerTypeCalls we map the types and create our ajax calls
	var doubleDamage = types.map(function(type) {
		return $.ajax({
			url: type.url,
			dataType: 'json',
			method: 'GET'
		});
	});

	// Using the same pattern from above we wait for all the calls to return
	$.when.apply(null,doubleDamage)
		.then(function() {
			// Arguments is an array LIKE value, we need to make it an ARRAY!
			var data = Array.prototype.slice.apply(arguments);
			// Create a new array of just the pokemon, not
			var arrayOfDoubleDmgPokemon = data.map(function(singleType) {
				return singleType[0].pokemon
			});
			// The array above is still an array of array's
			// So we flatten it.
			arrayOfDoubleDmgPokemon = flatten(arrayOfDoubleDmgPokemon);
			// Now we need to sort the pokemon!
			sortPokemon(arrayOfDoubleDmgPokemon);
		});
}

// We now have an array of the 
function sortPokemon(simpleTypes) {
	// Sort the types
	// Filter through types and get all the pokemon that are from the original 150
	var ogPokemon = simpleTypes.filter(function(poke) {
		// Loop through the pokemon array and get only the ones under or equal to 150
		// The array has objects that have a pokemon key, so we extract that.
		var selected = poke.pokemon;
		// Here we just sort of pull of the number from the url of the type
		// For example http://pokeapi.co/api/v2/pokemon/27/ this is a url
		// This line below will pull out this /27/
		var urlNum = selected.url.substring(32,selected.url.length);
		// This line will use a regex looking for the /'s and replace them with nothing
		// So we get 27
		var pokemonNum = urlNum.replace(/\//g,'');
		// new we only return if the number is <= 150!
		return pokemonNum <= 150;

	});
	// Here we just run a quick map the just the pokemon objects.
	ogPokemon = ogPokemon.map(function(pokemon) {
		return pokemon.pokemon;
	});
	//Send ogPokemon Array to buildPokemon function
	buildPokemon(ogPokemon);
}
// Show 6 pokemon for user to use.
function buildPokemon(ogPokemon) {
	// Pick 6 pokemon at random and make the AJAX calls
	var team = [];
	//Loop 6 times 
	for(var i = 0; i < 6; i++) {
		//Calling the getRandomPokemon function
		// Only current issue is that there are duplications
		// Should maybe remove pokemon after it is picked...
		// Read comments in function below for how getRandomPokemon works
		team.push( getRandomPokemon(ogPokemon) );
	}
	// Create the array of ajax calls.
	// This is the slowest call of the entire thing
	// There is a TON of info that comes back for each pokemon.
	var teamCalls = team.map(function(pokemon) {
		return $.ajax({
			url: pokemon.url,
			dataType: 'json'
		});
	});
	// Wait for all of them to be returned
	$.when.apply(null,teamCalls)
		.then(function() {
			// Make an array out of the arguments
			var pokemons = Array.prototype.slice.apply(arguments);
			// The returned promises are an array, we only want the object in the first index
			pokemons = pokemons.map(function(element) {
				return element[0];
			});
			// Send these pokemon to be displayed!
			displayPokemon(pokemons);
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
	pokemon.forEach(function(poke) {
		var $container = $('<div>').addClass('pokemon');
		var $image = $('<img>').attr('src','http://pokeapi.co/media/img/'+poke.id+'.png');
		var $title = $('<h2>').text(poke.name);
		$container.append($image,$title);
		$('.poke-container').append($container);
	});
}


// The flatten function
function flatten(array) {
	// This function accepts and array that has array's in it
	// It will then use the reduce method to concat them together.
	// Reduce will accept a callback and an initial value.
	// typically reduce will sum up some values, but in our cause 
	// If we start reduce with an empty array, we can use that to concat the sub array's
	console.log(array);
	return array.reduce(function(a,b) {
		// The first time this callback runs a will be the empty array below
		// we use the concat method to take b ( which is the first array in our passed array)
		// and concat them together. It will run until there are no more elements in the array. 
		return a.concat(b);
	},[]);
}














	