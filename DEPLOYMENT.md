# RoadRage Multiplayer Deployment Guide

This guide will help you deploy the RoadRage multiplayer server so you can play with friends in different countries.

## Deployment Options

There are several cloud platforms where you can deploy your RoadRage server:

1. **Heroku** - Easy to use, has a free tier with limitations
2. **Render** - Simple deployment, generous free tier
3. **Railway** - Developer-friendly, good free tier
4. **DigitalOcean** - More control, requires more setup, paid service
5. **AWS** - Most flexible, complex setup, free tier available

## Preparing Your Code

Before deploying, make sure your code is ready:

1. The server code has been updated to use environment variables for port and host
2. A Procfile has been created for Heroku deployment
3. The client code has been updated to connect to your deployed server

## Deployment Instructions

### Option 1: Heroku Deployment

1. **Create a Heroku account**
   - Sign up at [heroku.com](https://www.heroku.com/)

2. **Install the Heroku CLI**
   - Download from [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
   - Verify installation: `heroku --version`

3. **Login to Heroku**
   ```
   heroku login
   ```

4. **Create a new Heroku app**
   ```
   heroku create your-roadrage-app-name
   ```

5. **Push your code to Heroku**
   ```
   git push heroku master
   ```

6. **Open your deployed app**
   ```
   heroku open
   ```

7. **Configure your client**
   - Update `static/js/config.js` with your Heroku app URL:
   ```javascript
   SERVER: {
       URL: "https://your-roadrage-app-name.herokuapp.com",
       OFFLINE_MODE: false
   }
   ```

### Option 2: Render Deployment

1. **Create a Render account**
   - Sign up at [render.com](https://render.com/)

2. **Create a new Web Service**
   - Connect your GitHub repository
   - Select the branch to deploy
   - Set the build command: `pip install -r requirements.txt`
   - Set the start command: `python server/app.py`

3. **Configure environment variables**
   - Add `PORT` with value `10000` (or any port Render supports)
   - Add `SECRET_KEY` with a secure random string

4. **Deploy your application**
   - Click "Create Web Service"

5. **Configure your client**
   - Update `static/js/config.js` with your Render app URL:
   ```javascript
   SERVER: {
       URL: "https://your-roadrage.onrender.com",
       OFFLINE_MODE: false
   }
   ```

### Option 3: Railway Deployment

1. **Create a Railway account**
   - Sign up at [railway.app](https://railway.app/)

2. **Create a new project**
   - Connect your GitHub repository
   - Railway will automatically detect your Python app

3. **Configure environment variables**
   - Add `SECRET_KEY` with a secure random string

4. **Deploy your application**
   - Railway will automatically deploy your app

5. **Configure your client**
   - Update `static/js/config.js` with your Railway app URL:
   ```javascript
   SERVER: {
       URL: "https://your-roadrage.up.railway.app",
       OFFLINE_MODE: false
   }
   ```

## Testing Your Deployment

1. **Verify the server is running**
   - Open your deployed URL in a browser
   - You should see the RoadRage game menu

2. **Test multiplayer functionality**
   - Open the game in two different browsers or devices
   - Create a room in one and join from the other
   - Verify that players can see each other

## Troubleshooting

### Common Issues

1. **Connection errors**
   - Check browser console for errors
   - Verify your server URL is correct
   - Ensure CORS is properly configured

2. **Server crashes**
   - Check server logs in your deployment platform
   - Look for error messages or exceptions

3. **Players can't see each other**
   - Verify Socket.IO connections are established
   - Check room joining functionality

### Getting Help

If you encounter issues, check:
- The deployment platform's documentation
- Socket.IO documentation
- Flask documentation
- GitHub issues for similar problems

## Updating Your Deployment

When you make changes to your code:

1. **Commit your changes**
   ```
   git add .
   git commit -m "Description of changes"
   ```

2. **Push to your deployment platform**
   - For Heroku: `git push heroku master`
   - For Render/Railway: Push to your GitHub repository, and they will automatically redeploy

## Security Considerations

1. **Use environment variables for sensitive information**
   - Never hardcode API keys, secrets, or passwords

2. **Set a strong SECRET_KEY**
   - This is used for session security

3. **Implement rate limiting**
   - Prevent abuse of your server resources

4. **Consider adding authentication**
   - For more serious deployments, add user accounts

## Cost Considerations

Most platforms offer free tiers with limitations:

- **Heroku**: Free tier apps sleep after 30 minutes of inactivity
- **Render**: Free tier has limited hours per month
- **Railway**: Free tier has usage limits

For reliable 24/7 hosting, consider paid tiers or dedicated servers. 