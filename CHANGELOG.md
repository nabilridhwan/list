# List v1.0.5-beta
-	Updated footer
-	Revert back to Vanilla theme
-	Updated FAQ page
-	Changed to Beta state

# List v1.0.4
-   Fixed `Randomizer` button issue that causes an `Internal Server Error`
-   Added a function that creates a `user_profile` object using the token (cleaner codebase).

# List v1.0.3
-   Added support for hosting on Heroku
-   When cloning, `users_data.json` will contain `[]`. Now users run the server just by running `node index.js`

# List v1.0.2
-   Added a 'Latest User' section on the home page.

# List v1.0.1
-   [Server-side] When running the NodeJS application. An argument is needed to be passed in order for the program to run. The argument needs to point to the JSON file containing the user data. So, instead of running like this: `node index.js`, its instead like this: `node index.js ./users_data.json`

# List v1.0.0
-   Rebrand of Spotifier to List for Spotify, as in Liked Songs `List`.
-   Implemented Dark Mode.
-   Updated the Privacy Policy page.
-   Added a FAQ Page.
-   The Users page will now show the `Latest liked song` for the user.
-   The profile page has a new button `Pick a random song!` which would open a random song from the user's list.
-   On desktop, the user's profile page will be split into two columns allowing for more contents to fit on the screen.
-   List is now protected by the `GNU Affero General Public License`

# Spotifier v2.0.1
-	Updated the homepage

# Spotifier v2.0.0 (Open Beta)
-   Revamped user interface
-   New data collection: User's profile image
-   Removed `/update` endpoint. Profile automatically updates upon signing in
-   Added several endpoints such as `/sign_in`, `/sign_up`, `/users`.
-   Removed redundant templating files
-   Revised all endpoints
-   Revised all functions (faster loading times) by implementing Promises when possible.

# Spotifier v1.0.0 (Internal Beta)
-   Initial function of Spotifier is working.