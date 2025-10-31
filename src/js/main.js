
document.addEventListener("DOMContentLoaded",init);

function init() {
    document.querySelector('select#game_select').addEventListener('click',gameSelected);
}

function gameSelected() {
    const gameSelect = document.getElementById("game_select");
    const selectedGame = gameSelect.value;
    console.log("Selected game:", selectedGame);

    const main = document.querySelector('main');

    if (selectedGame === "eagle_leader") {
        fetch('data/eagle_leader.json').then(response => response.json()).then(data => {
            console.log("Eagle Leader data loaded:", data);
            
            const fieldset = document.querySelector('fieldset#expansion_options');

            data.sets.forEach(set => {
                console.log(set.name)
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

            const button = document.createElement('button');
            button.type = 'button';
            button.id = 'expansions_next';
            button.textContent = 'Next';
            fieldset.appendChild(button);
      
            
        }).catch(error => {
            console.error("Error loading Eagle Leader data:", error);
        });
    }
}

