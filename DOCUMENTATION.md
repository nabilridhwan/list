# Developing
> Due to Spotify's strict API on callbacks, There is a few steps that is needed to acheive to run this locally perfectly.

1.  Creating a JSON file (to store user data).
    -   `echo "[]" > ./users_data.json`
    -   `users_data.json` should only contain `[]` inside
2.  Changing all redirect urls in
    -   `authenticate_user.ejs`
        -   Templating file to display for Sign Up
    -   `sign_in.ejs`
        -   Templating file to display for Sign In

    -   So, there is a function (in `<script>` in both `ejs` file above) - [The reason why it is not server sided is because Hash fragments are not sent server-sided and is only visible on the browser itself, so by leveraging the `ejs` files, I used the `window` object to get the token return.] which returns a URL called `authorise_user(client_id, redirect_uri, show_dialog, scope)`. Just change the `redirect_uri` and `client_id` to your Spotify Project `valid redirect_uri` and `client_id`. Read more on [Spotify Authorization](https://developer.spotify.com/documentation/general/guides/authorization-guide/). And why the `redirect_uri` must be a valid one.

        -   Since im running locally, the redirect uri should be `http://127.0.0.1:8080/` or `http://127.0.0.1:8080/update` according to the `ejs` file.

3.  Update `CHANGELOG.md` so that users know what is changed. For any extra data collection, please add details at `privacypolicy.ejs`. Note that List uses the semantic version naming scheme.

4.  Make a PR. A good one. Imagine that you are the one reviewing, its good to know what you have modified or deleted.

5.  Run the server by `node index.js`