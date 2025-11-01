
/* Main JavaScript for Random Leader Squadron Generator 

Quite hacky but its a simple low risk project. Enough that it works.
*/


document.addEventListener("DOMContentLoaded",init);

var selectedGame = "";
var gameData = {};
var selectedExpansions = [];
var selectedYear = 0;
var selectedLength = "s";
var selectedForces = [];
var selectedAircraft = [];
var aircraftPool = [];
var pilotPool = [];
var ranks = {};
var rulesSOs = 0
var squadronSize = 0;
var randomName = "Random Squadron";

function init() {
    document.querySelector('button#selected_game').addEventListener('click',gameSelected);
    document.querySelector('button#selected_expansions').addEventListener('click',expansionSelected);
    document.querySelector('button#selected_year').addEventListener('click',yearSelected);
    document.querySelector('button#selected_length').addEventListener('click',lengthSelected);
    document.querySelector('button#selected_forces').addEventListener('click',forcesSelected);
    document.querySelector('button#selected_aircraft').addEventListener('click',aircraftSelected);
    document.querySelector('button#restart').addEventListener('click',restart);
    document.querySelector('button#restart_results').addEventListener('click',restart);
}

function gameSelected() {
    const gameSelect = document.getElementById("game_select");
    const selectedGame = gameSelect.value;
    
    const main = document.querySelector('main');

    
    fetch('data/'+selectedGame+'.json').then(response => response.json()).then(data => {
        //console.log("Eagle Leader data loaded:", data);
        gameData = data;

        //populate expansion options
        const fieldset = document.querySelector('fieldset#expansion_options');

        data.sets.forEach(set => {
            //console.log(set.name)
            const box = document.createElement('input');
            box.type = 'checkbox';
            box.name = set.name;
            box.checked = true;
            const label = document.createElement('label');
            label.htmlFor = set.name;
            
            label.appendChild(box);
            label.appendChild(document.createTextNode(" "+set.name));
            fieldset.appendChild(label);
        });      
    }).catch(error => {
        console.error("Error loading data:", error);
    });
    
    document.getElementById("game").style.display = "none";
    document.getElementById("expansions").style.display = "block";
}

function expansionSelected() {
    const checkboxes = document.querySelectorAll('fieldset#expansion_options input[type="checkbox"]');
    selectedExpansions = [];
    checkboxes.forEach(box => {
        if (box.checked) {
            selectedExpansions.push(box.name);
        }
    });
    

    console.log("Selected expansions:", selectedExpansions);
    //for each selected expansion, put the aircraft data into the aircraft pool.
    selectedExpansions.forEach(expansion => {
        console.log("Adding aircraft from expansion:", expansion);
        const set = gameData.sets.find(s => s.name === expansion);
        if (set) {
            set.aircraft.forEach(aircraft => {
                aircraftPool.push(aircraft);
            });
        }});

    squadronSize = Object.values(gameData.squadron_ranks['s']).reduce((a, b) => a + b, 0);
    var currentPoolSize = aircraftPool.reduce((acc, aircraft) => acc + aircraft.pilots.length, 0);
    document.getElementById("year_pool").textContent = currentPoolSize;
    if (currentPoolSize < squadronSize) {
        document.getElementById("error").style.display = "block";
        document.getElementById("expansions").style.display = "none";
        return;
    }
    generateRandomSquadronName();
    document.getElementById("expansions").style.display = "none";
    document.getElementById("year").style.display = "block";
}

function yearSelected() {
    const yearSelect = document.getElementById("year_input");
    selectedYear = parseInt(yearSelect.value);
    //console.log("Selected year:", selectedYear);
    //filter aircraft pool to only include aircraft available in that year
    for (let i = aircraftPool.length - 1; i >= 0; i--) {
        const aircraft = aircraftPool[i];
        if (aircraft.year_start > selectedYear || aircraft.year_end < selectedYear) {
            console.log("Removing aircraft not available in year", selectedYear + ":", aircraft.name);
            aircraftPool.splice(i, 1);
        }
    }
    //console.log("Filtered aircraft pool:", aircraftPool);
    var currentPoolSize = aircraftPool.reduce((acc, aircraft) => acc + aircraft.pilots.length, 0);
    if (currentPoolSize < squadronSize) {
        document.getElementById("error").style.display = "block";
        document.getElementById("year").style.display = "none";
        return;
    }

    document.getElementById("length_pool").textContent = aircraftPool.reduce((acc, aircraft) => acc + aircraft.pilots.length, 0);
    document.getElementById("year").style.display = "none";
    document.getElementById("length").style.display = "block";
}

function lengthSelected() {
    const lengthSelect = document.getElementById("length_select");
    selectedLength = lengthSelect.value;
    //console.log("Selected length:", selectedLength);

    squadronSize = Object.values(gameData.squadron_ranks[selectedLength.toLowerCase().charAt(0)]).reduce((a, b) => a + b, 0);

    //get a list of forces from the aircraft pool
    const forcesSet = new Set();
    aircraftPool.forEach(aircraft => {
        forcesSet.add(aircraft.force);
    });
    const forcesList = Array.from(forcesSet);
    //console.log("Available forces in aircraft pool:", forcesList);

    //add ranks for selected length
    ranks = gameData.squadron_ranks[selectedLength.charAt(0)];
    //console.log("Ranks for selected length:", ranks);

    rulesSOs = gameData.random_squadron_so[selectedLength.charAt(0)];
    //populate force options
    const fieldset = document.querySelector('fieldset#force_options');
    fieldset.innerHTML = ""; //clear existing options
    forcesList.forEach(force => {
        const box = document.createElement('input');
        box.type = 'checkbox';
        box.name = force;
        box.checked = true;
        const label = document.createElement('label');
        label.htmlFor = force;
        
        label.appendChild(box);
        label.appendChild(document.createTextNode(" "+force + " ("+aircraftPool.filter(a => a.force === force).reduce((acc, aircraft) => acc + aircraft.pilots.length, 0)+" pilots)"));
        fieldset.appendChild(label);
    });
    var currentPoolSize = aircraftPool.reduce((acc, aircraft) => acc + aircraft.pilots.length, 0);
    if (currentPoolSize < squadronSize) {
        document.getElementById("error").style.display = "block";
        document.getElementById("length").style.display = "none";
        return;
    }

    document.getElementById("forces_pool").textContent = currentPoolSize;
    document.getElementById("length").style.display = "none";
    document.getElementById("forces").style.display = "block";
}

function forcesSelected() {
    const forceCheckboxes = document.querySelectorAll('fieldset#force_options input[type="checkbox"]');
    selectedForces = [];
    forceCheckboxes.forEach(box => {
        if (box.checked) {
            selectedForces.push(box.name);
        }
    });
    //console.log("Selected forces:", selectedForces);

    //filter aircraft pool to only include aircraft from selected forces
    for (let i = aircraftPool.length - 1; i >= 0; i--) {
        const aircraft = aircraftPool[i];
        if (!selectedForces.includes(aircraft.force)) {
            //console.log("Removing aircraft not in selected forces:", aircraft.name);
            aircraftPool.splice(i, 1);
        }
    }
    //console.log("Filtered aircraft pool after forces selection:", aircraftPool);
    //populate aircraft options
    const fieldset = document.querySelector('fieldset#aircraft_options');
    fieldset.innerHTML = ""; //clear existing options
    aircraftPool.forEach(aircraft => {
        const box = document.createElement('input');
        box.type = 'checkbox';
        box.name = aircraft.name + "$"+aircraft.force;
        box.checked = true;
        const label = document.createElement('label');
        label.htmlFor = aircraft.name + "$"+aircraft.force;
        
        label.appendChild(box);
        label.appendChild(document.createTextNode(" "+aircraft.name+" ("+aircraft.force+", "+aircraft.pilots.length+" pilots)"));
        fieldset.appendChild(label);
    });

    var currentPoolSize = aircraftPool.reduce((acc, aircraft) => acc + aircraft.pilots.length, 0);
    if (currentPoolSize < squadronSize) {
        document.getElementById("error").style.display = "block";
        document.getElementById("forces").style.display = "none";
        return;
    }

    document.getElementById("aircraft_pool").textContent = currentPoolSize;
    document.getElementById("forces").style.display = "none";
    document.getElementById("aircraft").style.display = "block";
}

function aircraftSelected() {
    const aircraftCheckboxes = document.querySelectorAll('fieldset#aircraft_options input[type="checkbox"]');
    selectedAircraft = [];
    aircraftCheckboxes.forEach(box => {
        if (box.checked) {
            selectedAircraft.push(box.name);
        }
    });
    console.log("Selected aircraft:", selectedAircraft);

    pilotPool = [];
    selectedAircraft.forEach(boxName => {

        const aircraft = aircraftPool.find(a => a.name === boxName.split('$')[0] && a.force === boxName.split('$')[1]);
        if (aircraft) {
            aircraft.pilots.forEach(pilot => {
                var pilotEntry = {pilot:pilot, aircraft:aircraft.name, force:aircraft.force, so:aircraft.so[selectedLength.charAt(0)]};
                pilotPool.push(pilotEntry);
            });
        }
    });
    console.log("Compiled pilot pool:", pilotPool);

    if (pilotPool.length < squadronSize) {
        document.getElementById("error").style.display = "block";
        document.getElementById("aircraft").style.display = "none";
        return;
    }

    //add a table row in results_table for each entry in data.squadron_ranks
    const resultsTableBody = document.querySelector('table#results_table tbody');
    resultsTableBody.innerHTML = ""; //clear existing rows
    for(let rankKey in ranks) {
        for(var i=0; i<ranks[rankKey]; i++) {
            //select a random pilot from the pilot pool
            const randomIndex = Math.floor(Math.random() * pilotPool.length);
            const pilotEntry = pilotPool[randomIndex];

            const row = document.createElement('tr');
            const rankCell = document.createElement('td');
            rankCell.textContent = rankKey;
            rankCell.className = rankKey.toLowerCase()+"_cell";
            row.appendChild(rankCell);

            const nameCell = document.createElement('td');
            nameCell.textContent = pilotEntry.pilot;
            nameCell.className = "pilot_name_cell";
            row.appendChild(nameCell);

            const aircraftCell = document.createElement('td');
            aircraftCell.textContent = pilotEntry.aircraft;
            aircraftCell.className = "aircraft_cell";
            row.appendChild(aircraftCell);

            const forceCell = document.createElement('td');
            forceCell.textContent = pilotEntry.force;
            forceCell.className = "force_cell";
            row.appendChild(forceCell);

            const soCell = document.createElement('td');
            soCell.textContent = pilotEntry.so;
            soCell.className = "so_cell";
            row.appendChild(soCell);

            //add a cell with a button to remove this pilot from the pool and regenerate the row
            const actionCell = document.createElement('td');
            actionCell.className = "action_cell";
            const removeButton = document.createElement('span');
            removeButton.textContent = "🎲";
            removeButton.classList.add("reroll_button");
            removeButton.addEventListener('click', () => {
                if (pilotPool.length === 0) {
                    alert("No more pilots available to select from!");
                    return;
                }
                
                //regenerate this row
                regenerateRow(row, rankKey);
            });
            actionCell.appendChild(removeButton);
            row.appendChild(actionCell);
            pilotPool.splice(randomIndex, 1);
        

        resultsTableBody.appendChild(row);
    }}
    generateTotalSO();

    document.getElementById("squadron_name").innerHTML = randomSquadronName;
    document.getElementById("aircraft").style.display = "none";
    document.getElementById("results").style.display = "block";
    
}

function regenerateRow(row, rankKey) {
    //select a random pilot from the pilot pool
    const randomIndex = Math.floor(Math.random() * pilotPool.length);
    const pilotEntry = pilotPool[randomIndex];

    //update the row cells
    row.cells[1].textContent = pilotEntry.pilot;
    row.cells[2].textContent = pilotEntry.aircraft;
    row.cells[3].textContent = pilotEntry.force;
    row.cells[4].textContent = pilotEntry.so;

    //remove pilot from pool
    pilotPool.splice(randomIndex, 1);

    generateTotalSO();
}

function generateTotalSO() {
    let totalSO = 0;
    const resultsTableBody = document.querySelector('table#results_table tbody');
    for (let i = 0; i < resultsTableBody.rows.length; i++) {
        const soValue = parseInt(resultsTableBody.rows[i].cells[4].textContent);
        totalSO += soValue;
    }
    //console.log("Total SO of squadron:", totalSO);
    document.getElementById("rules_sos").textContent = rulesSOs;
    document.getElementById("pilot_sos").textContent = totalSO;
    const overall = rulesSOs + totalSO;
    const final = document.getElementById("total_sos");
    if (overall >= 0) {
        final.textContent = "Gain " + overall + " SOs";
    } else {
        final.textContent = "Pay " + Math.abs(overall) + " SOs";
    }
}

function restart() {
    //reset all variables and UI
    selectedGame = "";
    gameData = {};
    selectedExpansions = [];
    selectedYear = 0;
    selectedLength = "s";
    selectedForces = [];
    selectedAircraft = [];
    aircraftPool = [];
    pilotPool = [];
    ranks = {};
    rulesSOs = 0;
    squadronSize = 0;

    document.getElementById("results").style.display = "none";
    document.getElementById("length").style.display = "none";
    document.getElementById("year").style.display = "none";
    document.getElementById("forces").style.display = "none";
    document.getElementById("aircraft").style.display = "none";
    document.getElementById("expansions").style.display = "none";
    document.getElementById("error").style.display = "none";
    document.getElementById("game").style.display = "block";

    //clear all fieldsets
    document.querySelector('fieldset#expansion_options').innerHTML = "";
    document.querySelector('fieldset#force_options').innerHTML = "";
    document.querySelector('fieldset#aircraft_options').innerHTML = "";

    //clear results table
    document.querySelector('table#results_table tbody').innerHTML = "";
}

function randomAdjective() {
        return fetch('data/adjectives.json')
            .then(response => {
                if (!response.ok) throw new Error('Failed to load adjectives.json');
                return response.json();
            })
            .then(list => {
                if (!Array.isArray(list) || list.length === 0) return '';
                var out = list[Math.floor(Math.random() * list.length)]
                out = out.charAt(0).toUpperCase() + out.slice(1);
                return out;
            })
            .catch(err => {
                console.error('Error loading adjectives:', err);
                return '';
            });
}

function randomAnimal() {
    return fetch('data/animals.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load animals.json');
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                var out = data[Math.floor(Math.random() * data.length)]
                out = out.charAt(0).toUpperCase() + out.slice(1);
                return out;
            }
            return '';
        })
        .catch(err => {
            console.error('Error loading animals:', err);
            return '';
        });
}

async function generateRandomSquadronName() {
    randomSquadronName = "The "+ await randomAdjective() + " " + await randomAnimal();
}

