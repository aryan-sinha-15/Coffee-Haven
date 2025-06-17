// Handle authentication state
auth.onAuthStateChanged(user => {
  const authStatusElement = document.getElementById('auth-status');
  
  if (user) {
    // User is signed in
    localStorage.setItem('coffeeHavenUser', JSON.stringify({
      email: user.email,
      name: user.displayName || user.email.split('@')[0],
      uid: user.uid
    }));
    
    authStatusElement.innerHTML = `
      <div class="user-dropdown">
        <span>Hi, ${user.displayName || user.email.split('@')[0]}</span>
        <div class="dropdown-content">
          <a href="#" id="logout-btn">Logout</a>
        </div>
      </div>
    `;
    
    document.getElementById('logout-btn').addEventListener('click', (e) => {
      e.preventDefault();
      auth.signOut().then(() => {
        localStorage.removeItem('coffeeHavenUser');
        window.location.reload();
      });
    });
    
    // Merge guest cart with user cart if exists
    const guestCart = localStorage.getItem('coffeeHavenGuestCart');
    if (guestCart) {
      db.collection('userCarts').doc(user.uid).set({
        items: JSON.parse(guestCart),
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      }).then(() => {
        localStorage.removeItem('coffeeHavenGuestCart');
        toastr.success('Your cart has been saved to your account!');
      });
    }
  } else {
    // User is signed out
    localStorage.removeItem('coffeeHavenUser');
    if (authStatusElement) {
      authStatusElement.innerHTML = `
        <a href="login.html" class="btn btn-sm">Login</a>
      `;
    }
  }
});

// Social login functions
function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      toastr.success('Google login successful!');
      if (result.additionalUserInfo.isNewUser) {
        db.collection('users').doc(result.user.uid).set({
          name: result.user.displayName,
          email: result.user.email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    })
    .catch((error) => {
      toastr.error('Google login failed: ' + error.message);
    });
}

function facebookLogin() {
  const provider = new firebase.auth.FacebookAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      toastr.success('Facebook login successful!');
      if (result.additionalUserInfo.isNewUser) {
        db.collection('users').doc(result.user.uid).set({
          name: result.user.displayName,
          email: result.user.email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    })
    .catch((error) => {
      toastr.error('Facebook login failed: ' + error.message);
    });
}

function twitterLogin() {
  const provider = new firebase.auth.TwitterAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      toastr.success('Twitter login successful!');
      if (result.additionalUserInfo.isNewUser) {
        db.collection('users').doc(result.user.uid).set({
          name: result.user.displayName,
          email: result.user.email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    })
    .catch((error) => {
      toastr.error('Twitter login failed: ' + error.message);
    });
}