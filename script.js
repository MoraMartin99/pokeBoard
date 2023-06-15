/* Variables globales */
/* ----------------------------------------------------------------------------------------------------------------- */
const pokemonCardArr = Array.from(document.querySelectorAll(".pokemonCard"));
const itemCardArr = Array.from(document.querySelectorAll(".itemCard"));
const nearbyCardArr = Array.from(document.querySelectorAll(".nearbyCard"));
const menuButton = document.querySelector("#menuButton");
const returnButton = document.querySelector("#returnButton");
const asideMenu = document.querySelector("#asideMenu");
const asideMenuContainer = document.querySelector("#asideMenuContainer");
/* ----------------------------------------------------------------------------------------------------------------- */

/* Funciones de bajo nivel */
/* ----------------------------------------------------------------------------------------------------------------- */
const getJSONfromURL = (url) => {
    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Error: no se pudo obtener el recurso
                url: ${url} 
                status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            return data;
        });
};

const getRandomNumberArr = (min, max, n) => {
    let arr = [];
    let newNumber;
    const delta = () => {
        return Math.round((max - min) * Math.random());
    };
    while (arr.length != n) {
        newNumber = min + delta();
        if (!arr.includes(newNumber)) {
            arr.push(newNumber);
        }
    }
    return arr;
};

const removeClass = (element, classArr) => {
    classArr.forEach((currentClass) => {
        element.classList.remove(currentClass);
    });
};

const addClass = (element, classArr) => {
    classArr.forEach((currentClass) => {
        element.classList.add(currentClass);
    });
};
/* ----------------------------------------------------------------------------------------------------------------- */

/* Funciones para obtener objetos */
/* ----------------------------------------------------------------------------------------------------------------- */
async function getCardObjArr(n, baseURL, getCardObjFn, customMax = undefined) {
    let arr = [];
    const baseResponse = await getJSONfromURL(baseURL);
    const max = customMax ? customMax : baseResponse.count;
    const min = 1;
    let idArr = getRandomNumberArr(min, max, n);
    let index = 0;
    let cardObj;
    let id;
    let newId;

    while (index <= idArr.length - 1) {
        id = idArr[index];
        cardObj = await getCardObjFn(id, baseURL)
            .then((value) => {
                return value;
            })
            .catch((err) => {
                console.log(err);
                return null;
            });

        if (cardObj) {
            arr.push(cardObj);
        } else {
            newId = getRandomNumberArr(min, max, 1)[0];
            while (idArr.includes(newId)) {
                newId = getRandomNumberArr(min, max, 1)[0];
            }
            idArr.push(newId);
        }

        index++;
    }

    return arr;
}

async function getPokemonCardObj(id, baseURL) {
    const pokemonIDURL = baseURL.concat(`${id}/`);
    const oldPokemonObj = await getJSONfromURL(pokemonIDURL);
    let newPokemonObj;
    const name = oldPokemonObj.name;
    let type =
        typeof oldPokemonObj.types !== "object"
            ? undefined
            : Object.values(oldPokemonObj.types).reduce((arr, currentItem) => {
                  arr.push(currentItem.type.name);
                  return arr;
              }, []);
    const imageURL = oldPokemonObj.sprites.front_default;
    let hp;
    let attack;
    let defense;
    let statName;

    if (typeof type !== "undefined") {
        if (type.length == 0 || type.includes(undefined)) {
            type = undefined;
        }
    }

    if (typeof oldPokemonObj.stats === "object") {
        for (let item of Object.values(oldPokemonObj.stats)) {
            statName = item.stat.name;
            if (statName === "hp") {
                hp = item.base_stat;
            } else if (statName === "attack") {
                attack = item.base_stat;
            } else if (statName === "defense") {
                defense = item.base_stat;
            }

            if (hp && attack && defense) {
                break;
            }
        }
    }

    if (!name || !type || !imageURL || !hp || !attack || !defense) {
        throw new Error(`Error: el objeto no tiene definida alguna propiedad
        url: ${pokemonIDURL}
        name: ${name}
        type: ${type}
        imageURL: ${imageURL}
        hp: ${hp}
        attack: ${attack}
        defense: ${defense}`);
    }

    newPokemonObj = new PokemonCardObj(name, type, imageURL, hp, attack, defense);
    return newPokemonObj;
}

async function getItemCardObj(id, baseURL) {
    const itemIDURL = baseURL.concat(`${id}/`);
    const oldItemObj = await getJSONfromURL(itemIDURL);
    let newItemObj;
    let name;
    const imageURL = oldItemObj.sprites.default;
    const number = getRandomNumberArr(1, 99, 1)[0];

    if (oldItemObj.name) {
        if (oldItemObj.name.length > 12) {
            name = undefined;
        } else {
            name = oldItemObj.name.replaceAll("-", " ");
        }
    }

    if (!name || !imageURL || !number) {
        throw new Error(`Error: el objeto no tiene definida alguna propiedad
        url: ${itemIDURL}
        name: ${name}
        imageURL: ${imageURL}
        number: ${number}`);
    }

    newItemObj = new ItemCardObj(name, imageURL, number);
    return newItemObj;
}

async function getNearbyCardObj(id, baseURL) {
    const pokemonIDURL = baseURL.concat(`${id}/`);
    const oldPokemonObj = await getJSONfromURL(pokemonIDURL);
    let newPokemonObj;
    let name;
    const imageURL = oldPokemonObj.sprites.front_default;
    const distance = `${getRandomNumberArr(1, 99, 1)[0]} m`;

    if (oldPokemonObj.name) {
        if (oldPokemonObj.name.length > 11) {
            name = undefined;
        } else {
            name = oldPokemonObj.name;
        }
    }

    if (!name || !imageURL || !distance) {
        throw new Error(`Error: el objeto no tiene definida alguna propiedad
        url: ${pokemonIDURL}
        name: ${name}
        imageURL: ${imageURL}
        distance: ${distance}`);
    }

    newPokemonObj = new NearbyCardObj(name, imageURL, distance);
    return newPokemonObj;
}
/* ----------------------------------------------------------------------------------------------------------------- */

/* Constructores de objetos */
/* ----------------------------------------------------------------------------------------------------------------- */
function PokemonCardObj(name, types, imageURL, hp, attack, defense) {
    this.name = name;
    this.types = types;
    this.imageURL = imageURL;
    this.hp = hp;
    this.attack = attack;
    this.defense = defense;
}

function ItemCardObj(name, imageURL, number) {
    this.name = name;
    this.imageURL = imageURL;
    this.number = number;
}

function NearbyCardObj(name, imageURL, distance) {
    this.name = name;
    this.imageURL = imageURL;
    this.distance = distance;
}
/* ----------------------------------------------------------------------------------------------------------------- */

/* Funciones para definir el contenido de las cards */
/* ----------------------------------------------------------------------------------------------------------------- */
const setPokemonCard = (element, obj) => {
    const value = `<div class="topContainer">
                            <p class="cardTitle">${obj.name}</p>
                            <p class="cardType">${obj.types.join(" ")}</p>
                        </div>
                        <img src="${obj.imageURL}" alt="pokemon image" class="pokemonImg" />
                        <div class="bottomContainer">
                            <div class="hpGroup statGroups">
                                <p class="statTitle">hp</p>
                                <p class="statValue">${obj.hp}</p>
                            </div>
                            <div class="attackGroup statGroups">
                                <p class="statTitle">attack</p>
                                <p class="statValue">${obj.attack}</p>
                            </div>
                            <div class="defenseGroup statGroups">
                                <p class="statTitle">defense</p>
                                <p class="statValue">${obj.defense}</p>
                            </div>
                        </div>`;
    element.innerHTML = value;
};

const setItemCard = (element, obj) => {
    const value = `<div class="itemTextContainer">
                            <p class="itemTitle">${obj.name}</p>
                            <p class="itemQuantity">${obj.number}</p>
                        </div>
                        <img src="${obj.imageURL}" alt="item image" class="itemImage" />`;
    element.innerHTML = value;
};

const setNearbyCard = (element, obj) => {
    const value = `<div class="nearbyLeftGroup">
                            <p class="nearbyTitle">${obj.name}</p>
                            <div class="nearbyDistanceGroup">
                                <p class="nearbyDistance">${obj.distance}</p>
                            </div>
                        </div>
                        <img src="${obj.imageURL}" alt="nearby image" class="nearbyImg" />`;
    element.innerHTML = value;
};
/* ----------------------------------------------------------------------------------------------------------------- */

/* Funciones para cargar contenido */
/* ----------------------------------------------------------------------------------------------------------------- */
async function loadCards() {
    const pokemonCardNumber = pokemonCardArr.length;
    const pokemonCardBaseURL = "https://pokeapi.co/api/v2/pokemon/";
    const pokemonCardObjArr = await getCardObjArr(pokemonCardNumber, pokemonCardBaseURL, getPokemonCardObj);
    const itemCardNumber = itemCardArr.length;
    const itemCardBaseURL = "https://pokeapi.co/api/v2/item/";
    const itemCardObjArr = await getCardObjArr(itemCardNumber, itemCardBaseURL, getItemCardObj, 1000);
    const nearbyCardNumber = nearbyCardArr.length;
    const nearbyCardBaseURL = pokemonCardBaseURL;
    const nearbyCardObjArr = await getCardObjArr(nearbyCardNumber, nearbyCardBaseURL, getNearbyCardObj);

    pokemonCardArr.forEach((card, index) => {
        removeClass(card, ["cardLoading"]);
        setPokemonCard(card, pokemonCardObjArr[index]);
    });

    itemCardArr.forEach((card, index) => {
        removeClass(card, ["cardLoading"]);
        setItemCard(card, itemCardObjArr[index]);
    });

    nearbyCardArr.forEach((card, index) => {
        removeClass(card, ["cardLoading"]);
        setNearbyCard(card, nearbyCardObjArr[index]);
    });
}

const showAsideMenu = (e) => {
    removeClass(asideMenu, ["hide"]);
};

const hideasideMenuContainer = (e) => {
    const target = e.target;

    if (target.matches("#returnButton") || target.matches("#asideMenu")) {
        addClass(asideMenuContainer, ["slideOut"]);
        addClass(asideMenu, ["fadeOut"]);
    }
};

const hideAsideMenu = (e) => {
    const animationName = e.animationName;

    if (animationName === "slideOut") {
        removeClass(asideMenuContainer, ["slideOut"]);
        removeClass(asideMenu, ["fadeOut"]);
        addClass(asideMenu, ["hide"]);
    }
};
/* ----------------------------------------------------------------------------------------------------------------- */

/* Event listener */
/* ----------------------------------------------------------------------------------------------------------------- */
menuButton.addEventListener("click", showAsideMenu);
asideMenu.addEventListener("click", hideasideMenuContainer);
asideMenuContainer.addEventListener("animationend", hideAsideMenu);
/* ----------------------------------------------------------------------------------------------------------------- */

/* Inicio al cargar la página */
/* ----------------------------------------------------------------------------------------------------------------- */
loadCards();
/* ----------------------------------------------------------------------------------------------------------------- */
