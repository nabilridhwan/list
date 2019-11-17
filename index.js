const express = require('express');
const fetch = require('node-fetch');
const app = express();
const fs = require('fs');

const __userdatadir = "./users_data.json"

app.set('view engine', 'ejs');

app.get('/', (request, response) => {
    fs.readFile(__userdatadir, (err, data) => {
        response.render('index', {
            users: JSON.parse(data)
        })
    })
})

app.get('/sign_up', (request, response) => {
    response.render('authenticate_user')
})

app.get('/privacypolicy', (request, response) =>{
    response.render('privacypolicy')
})

app.get('/post_authentication/:token', (request, response) => {

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

            // Write user profile
            user_profile = {
                "name": name,
                "id": id,
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

                    new UserHandler().write(user_profile)
                    response.redirect(`/user/${user_profile["id"]}`)
                })

        })

})

app.get('/user/:id', (request, response) => {

    let id = request.params.id;
    let compilation_id = []
    let user = {};

    // Get data of the person id
    fs.readFile(__userdatadir, (err, data) => {
        let people = JSON.parse(data);

        // Check if person exists
        people.forEach((person, n) => {
            compilation_id.push(person["id"])
        })
    })

    setTimeout(() => {
        if (compilation_id.includes(id)) {
            // Set the user
            let index = compilation_id.indexOf(id)

            fs.readFile(__userdatadir, (err, data) => {
                let people = JSON.parse(data);
                user = people[index]

                setTimeout(() => {
                    response.render("user", {
                        user: user
                    })
                }, 100);
            })
        } else {
            response.render("no_user_found")
        }
    }, 100);
})

app.get("/update", (request, response) => {

    let token = request.query.token;
    let id, liked_songs;

    if (token) {
        //Authenticated
        // Update

        // Get user details (name, id)
        fetch("https://api.spotify.com/v1/me", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(response => response.json())
            .then(json => {
                id = json.id

                // Fetch liked songs
                fetch("https://api.spotify.com/v1/me/tracks?limit=50", {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    }).then(response => response.json())
                    .then(json => {

                        // Empty it first
                        liked_songs = []

                        json.items.forEach(item => {
                            let track_name = item.track.name
                            let track_artist_name = item.track.artists[0].name
                            let album_image = item.track.album.images[0].url
                            let open_html_link = item.track.external_urls.spotify;

                            // push to liked_songs
                            liked_songs.push({
                                "track_name": track_name,
                                "track_artist_name": track_artist_name,
                                "album_image": album_image,
                                "open_html_link": open_html_link
                            })
                        })

                        new UserHandler().update(id, liked_songs)
                        response.redirect(`/user/${id}`)
                    })

            })
    } else {
        response.render('authenticate_user_update')
        response.end()
    }
})

app.get("/api/view/all", (request, response) => {
    fs.readFile(__userdatadir, (err, data) => {
        response.send(JSON.parse(data));
    })
})

if(process.env.IP && process.env.PORT){
    app.listen(process.env.PORT, process.env.IP, () => {
        console.log(`Listening on: ${process.env.IP}:${process.env.PORT}`)
    })
}else{
    app.listen(8080, () => {
        console.log(`Listening on: 127.0.0.1:8080`)
    })
}

// functions creates, update users using the write function
class UserHandler {
    write(user_profile) {

        // How the program check for duplicates?
        //  We compile all the ID first

        let id = user_profile["id"]
        let isDuplicate = null;
        let compilation_id = []
        console.log(isDuplicate)

        // Read the file
        fs.readFile(__userdatadir, (err, data) => {
            let people = JSON.parse(data);

            // COMPILE ID
            people.forEach(person => {

                // Push it to a variable
                compilation_id.push(person["id"])
            })

            // If the compilation id includes the profile's id
            if (compilation_id.includes(id)) {

                // Is duplicate - true
                isDuplicate = true
            } else {

                // Is duplicate - false
                isDuplicate = false
            }

            if (isDuplicate == false) {
                people.push(user_profile)
            }

            console.log(`Users: ${people.length}`)
            fs.writeFile(__userdatadir, JSON.stringify(people), (err) => {
                if (err) console.log(err)
            })
        })

    }

    update(id, liked_songs) {
        // Check if person exist
        let found = null;
        let compilation_id = []
        let index;

        // Read the file
        fs.readFile(__userdatadir, (err, data) => {
            let people = JSON.parse(data);
            // COMPILE ID
            people.forEach(person => {
                // Push it to a variable
                compilation_id.push(person["id"])
            })

            // If the compilation id includes the profile's id
            if (compilation_id.includes(id)) {
                console.log("USER FOUND")
                found = true
            } else {
                console.log("USER NOT FOUND")
                found = false
            }

            index = compilation_id.indexOf(id)

            // if y
            if (found == true) {
                people[index]["liked_songs"] = liked_songs
            }

            fs.writeFile(__userdatadir, JSON.stringify(people), (err) => {
                if (err) console.log(err)
            })
        })
    }
}