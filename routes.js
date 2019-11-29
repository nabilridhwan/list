const { Router } = require('express');
const fetch = require('node-fetch');
const fs = require('fs');

const routers = new Router();

const __userdatadir = "./users_data.json"

routers.get('/', (request, response) => {
    fs.readFile(__userdatadir, (err, data) => {
        response.render('index', {
            user: JSON.parse(data)
        })
    })
})

routers.get('/sign_up', (request, response) => {
    response.render('authenticate_user')
})

routers.get('/sign_up/:token', (request, response) => {

    let token = request.params.token

    user_profile(token).then(profile => {
        checkIfExist(profile['id']).then(result => {

            // If person exist (render the existing user page)
            if (result == true) {
                response.render('existing_user', {
                    user: profile
                })
            } else {

                // If person doesnt exist, create a new profile
                new UserHandler().create(profile)
                response.redirect(`/user/${profile["id"]}`)
            }
        })
    })
})

routers.get("/users", (request, response) => {
    fs.readFile(__userdatadir, (err, data) => {
        response.render('users', {
            users: JSON.parse(data)
        })
    })
})

routers.get("/sign_in", (request, response) => {
    response.render("sign_in")
})

routers.get("/sign_in/:token", (request, response) => {
    let token = request.params.token

    // Get user profile
    user_profile(token).then(profile => {
        checkIfExist(profile['id']).then(result => {
            // User exists (update account)
            if (result == true) {
                new UserHandler().update(profile)
                response.redirect(`/user/${profile["id"]}`)
            } else {
                // Create a new user
                new UserHandler().create(profile)
                response.redirect(`/user/${profile["id"]}`)
            }
        })
    })
})

routers.get('/user/:id', (request, response) => {
    let id = request.params.id;

    compile_id().then(compiled => {
        if (compiled.includes(id)) {
            // Set the user
            let index = compiled.indexOf(id)

            let profile = new Promise((resolve, reject) => {
                fs.readFile(__userdatadir, (err, data) => {
                    let people = JSON.parse(data);
                    resolve(people[index])
                })
            })

            profile.then(p => {
                response.render("profile", {
                    user: p
                })
            })

        } else {
            response.render("no_user_found")
        }
    })
})

routers.get('/privacypolicy', (request, response) => {
    response.render('privacypolicy')
})

routers.get('/faq', (request, response) => {
    response.render('faq')
})

routers.get("/api", (request, response) => {
    fs.readFile(__userdatadir, (err, data) => {
        response.send(JSON.parse(data));
    })
})



// Function to compile all IDs
let compile_id = async () => {
    return new Promise((resolve, reject) => {
        let compilation_id = []
        // Read the file
        fs.readFile(__userdatadir, (err, data) => {
            let people = JSON.parse(data);

            if (people.length > 0) {
                // COMPILE ID
                people.forEach(person => {
                    // Push it to a variable
                    compilation_id.push(person["id"])
                })
            }

            resolve(compilation_id)
        })
    })
}

// Function to get User Profile
let user_profile = (token) => {
    return new Promise((resolve, reject) => {
        {
            let get_user_details = new Promise((resolve, reject) => {
                // Get user details (name, id)
                fetch("https://api.spotify.com/v1/me", {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }).then(response => response.json())
                    .then(json => {
                        let name = json.display_name
                        let id = json.id
                        let images = json.images;

                        // Write user profile
                        resolve({
                            "name": name,
                            "id": id,
                            "images": images,
                            "liked_songs": [],
                            "recently_played": []
                        })

                    })
            })

            let get_liked_songs = (current_user) => {
                return new Promise((resolve, reject) => {
                    // Fetch liked songs
                    fetch("https://api.spotify.com/v1/me/tracks?limit=50", {
                            method: "GET",
                            headers: {
                                "Authorization": `Bearer ${token}`
                            }
                        }).then(response => response.json())
                        .then(json => {
                            // Empty it first
                            current_user["liked_songs"] = []
                            current_user["recently_played"] = []

                            json.items.forEach(item => {
                                let track_name = item.track.name
                                let track_artist_name = item.track.artists[0].name
                                let album_image = item.track.album.images[0].url
                                let open_html_link = item.track.external_urls.spotify;

                                // push to liked_songs
                                current_user["liked_songs"].push({
                                    "track_name": track_name,
                                    "track_artist_name": track_artist_name,
                                    "album_image": album_image,
                                    "open_html_link": open_html_link
                                })

                                resolve(current_user)
                            })

                        })
                })
            }

            let get_recently_played = (current_user) => {
                return new Promise((resolve, reject) => {
                    fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50", {
                            method: "GET",
                            headers: {
                                "Authorization": `Bearer ${token}`
                            }
                        }).then(response => response.json())
                        .then(json => {
                            // Empty it first
                            current_user["recently_played"] = []

                            json.items.forEach(item => {
                                let track_name = item.track.name
                                let track_artist_name = item.track.artists[0].name
                                let album_image = item.track.album.images[0].url
                                let open_html_link = item.track.external_urls.spotify;

                                // push to liked_songs
                                current_user["recently_played"].push({
                                    "track_name": track_name,
                                    "track_artist_name": track_artist_name,
                                    "album_image": album_image,
                                    "open_html_link": open_html_link
                                })

                                resolve(current_user)
                            })
                        })
                })
            }

            get_user_details.then(d => {
                get_liked_songs(d).then(d => {
                    get_recently_played(d).then(d => {
                        resolve(d)
                    })
                })
            })
        }
    })
}

// Function to check if user exist or not
function checkIfExist(user_id) {
    let isDuplicate = new Promise((resolve, reject) => {
        compile_id().then(compiled => {
            resolve(compiled.includes(user_id))
        })
    })

    return isDuplicate
}

// functions creates, update users using the create function
class UserHandler {
    create(user_profile) {

        let id = user_profile["id"]
        let current_write_data = [];

        let done_writing = new Promise((resolve, reject) => {
            fs.readFile(__userdatadir, (err, data) => {
                let people = JSON.parse(data)

                if (people.length > 0) {
                    checkIfExist(id).then(result => {
                        console.log(`Reulst! : ${result}`)
                        if (result == false) {
                            people.push(user_profile)
                            current_write_data = people;
                            resolve(true)
                        } else {
                            resolve(true)
                        }
                    })
                } else {
                    people.push(user_profile)
                    current_write_data = people;
                    resolve(true)
                }

            })
        })

        done_writing.then(data => {
            console.log(`Done Checking? ${data}`)
            // Write the data
            fs.writeFile(__userdatadir, JSON.stringify(current_write_data), (err) => {
                if (err) console.log(err)
            })
        })
    }

    update(user_profile) {
        let id = user_profile["id"]

        let found = new Promise((resolve, reject) => {
            compile_id().then(compiled => {
                compiled.forEach((id, n) => {
                    if (compiled[n] == id) {
                        resolve(n)
                    } else {
                        reject(false)
                    }
                })
            })
        })

        let write_Data = new Promise((resolve, reject) => {
            found.then(index => {
                fs.readFile(__userdatadir, (err, data) => {
                    let json = JSON.parse(data);
                    json[index]["liked_songs"] = user_profile["liked_songs"]
                    json[index]["recently_played"] = user_profile["recently_played"]
                    resolve(json)
                })
            })
        })

        write_Data.then(data => {
            fs.writeFile(__userdatadir, JSON.stringify(data), (err) => {
                if (err) console.log(err)
            })
        })

    }

}

module.exports = routers;