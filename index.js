const express = require('express');
const fetch = require('node-fetch');
const app = express();
const fs = require('fs');

const __userdatadir = process.argv[2]

app.set('view engine', 'ejs');

app.get('/', (request, response) => {
    response.render('index')
})

app.get('/sign_up', (request, response) => {
    response.render('authenticate_user')
})

app.get('/privacypolicy', (request, response) => {
    response.render('privacypolicy')
})

app.get('/sign_up/:token', (request, response) => {

    let token = request.params.token
    let user_profile = {};

    // Get user details (name, id)
    fetch("https://api.spotify.com/v1/me", {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(response => response.json())
        .then(json => {

            let name = json.display_name
            let id = json.id
            let images = json.images

            // Write user profile
            user_profile = {
                "name": name,
                "id": id,
                "images": images,
                "liked_songs": []
            }

            // Fetch liked songs
            fetch("https://api.spotify.com/v1/me/tracks?limit=50", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }).then(response => response.json())
                .then(json => {
                    // Empty it first
                    user_profile["liked_songs"] = []

                    json.items.forEach(item => {
                        let track_name = item.track.name
                        let track_artist_name = item.track.artists[0].name
                        let album_image = item.track.album.images[0].url
                        let open_html_link = item.track.external_urls.spotify;

                        // push to liked_songs
                        user_profile["liked_songs"].push({
                            "track_name": track_name,
                            "track_artist_name": track_artist_name,
                            "album_image": album_image,
                            "open_html_link": open_html_link
                        })
                    })

                    fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50", {
                            method: "GET",
                            headers: {
                                "Authorization": `Bearer ${token}`
                            }
                        }).then(response => response.json())
                        .then(json => {
                            // Empty it first
                            user_profile["liked_songs"] = []

                            json.items.forEach(item => {
                                let track_name = item.track.name
                                let track_artist_name = item.track.artists[0].name
                                let album_image = item.track.album.images[0].url
                                let open_html_link = item.track.external_urls.spotify;

                                // push to liked_songs
                                user_profile["recently_played"].push({
                                    "track_name": track_name,
                                    "track_artist_name": track_artist_name,
                                    "album_image": album_image,
                                    "open_html_link": open_html_link
                                })
                            })

                            checkIfExist(user_profile['id']).then(result => {
                                if (result == true) {
                                    response.render('existing_user', {
                                        user: user_profile
                                    })
                                } else {
                                    new UserHandler().write(user_profile)
                                    response.redirect(`/user/${user_profile["id"]}`)
                                }
                            })
                        })

                })

        })

})

app.get("/users", (request, response) => {
    fs.readFile(__userdatadir, (err, data) => {
        response.render('users', {
            users: JSON.parse(data)
        })
    })
})

app.get("/sign_in", (request, response) => {
    response.render("sign_in")
})

app.get("/sign_in/:token", (request, response) => {
    let token = request.params.token
    let user_profile = {};

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
            user_profile = {
                "name": name,
                "id": id,
                "images": images,
                "liked_songs": [],
                "recently_played": []
            }

            // Fetch liked songs
            fetch("https://api.spotify.com/v1/me/tracks?limit=50", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }).then(response => response.json())
                .then(json => {
                    // Empty it first
                    user_profile["liked_songs"] = []
                    user_profile["recently_played"] = []

                    json.items.forEach(item => {
                        let track_name = item.track.name
                        let track_artist_name = item.track.artists[0].name
                        let album_image = item.track.album.images[0].url
                        let open_html_link = item.track.external_urls.spotify;

                        // push to liked_songs
                        user_profile["liked_songs"].push({
                            "track_name": track_name,
                            "track_artist_name": track_artist_name,
                            "album_image": album_image,
                            "open_html_link": open_html_link
                        })
                    })

                    fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50", {
                            method: "GET",
                            headers: {
                                "Authorization": `Bearer ${token}`
                            }
                        }).then(response => {
                            console.log(response)
                            return response.json()
                        })
                        .then(json => {
                            // Empty it first
                            user_profile["recently_played"] = []

                            json.items.forEach(item => {
                                let track_name = item.track.name
                                let track_artist_name = item.track.artists[0].name
                                let album_image = item.track.album.images[0].url
                                let open_html_link = item.track.external_urls.spotify;

                                // push to liked_songs
                                user_profile["recently_played"].push({
                                    "track_name": track_name,
                                    "track_artist_name": track_artist_name,
                                    "album_image": album_image,
                                    "open_html_link": open_html_link
                                })
                            })

                            checkIfExist(user_profile['id']).then(result => {

                                // User exists (update account)
                                if (result == true) {
                                    new UserHandler().update(user_profile)
                                    response.redirect(`/user/${user_profile["id"]}`)
                                } else {
                                    // Create a new user
                                    new UserHandler().write(user_profile)
                                    response.redirect(`/user/${user_profile["id"]}`)
                                }
                            })
                        })
                })

        })
})

app.get('/user/:id', (request, response) => {

    let id = request.params.id;
    let user = {};

    compile_id().then(compiled => {
        if (compiled.includes(id)) {
            // Set the user
            let index = compiled.indexOf(id)

            fs.readFile(__userdatadir, (err, data) => {
                let people = JSON.parse(data);
                user = people[index]

                setTimeout(() => {
                    response.render("profile", {
                        user: user
                    })
                }, 100);
            })
        } else {
            response.render("no_user_found")
        }
    })

})

app.get('/faq', (request, response) => {
    response.render('faq')
})

app.get("/api", (request, response) => {
    fs.readFile(__userdatadir, (err, data) => {
        response.send(JSON.parse(data));
    })
})

if (process.env.IP && process.env.PORT) {
    app.listen(process.env.PORT, () => {
        console.log(`Listening on server: ${process.env.IP}:${process.env.PORT}`)
    })
} else {
    app.listen(8080, () => {
        console.log(`Listening on: 127.0.0.1:8080`)
    })
}

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

function checkIfExist(user_id) {
    let isDuplicate = new Promise((resolve, reject) => {
        compile_id().then(compiled => {
            resolve(compiled.includes(user_id))
        })
    })

    return isDuplicate
}

// functions creates, update users using the write function
class UserHandler {
    write(user_profile) {

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