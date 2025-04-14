# INFO1601_Project
This website uses NASA's APOD free API (required to sign up for a key) to display the APODs in a way that makes the posts easily accessible to persons interested such as by letting them view the past week of APODs, the current post of the day or view all the APODs for a particular month. It also gives users the opportunity to learn serendipitously thanks to the make your day better section of the website where it 'randomly' generates an APOD based on a selected group. 

The website also integrates the 7timer.info free API (does not require a key) to show the weather conditions at night for the user. It makes use of the users geolocation.

Firebase was used to authenticate users and firestore was used to store the users saved posts and comments.

If persons do intent on using this website you would need a NASA API key(this can be acquired by simply siging up for one), you will have to save it in a .js file as an object and you will need to configure firebase.