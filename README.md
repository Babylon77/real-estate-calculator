# Real Estate Flip Calculator

## MVP Release for User Testing

This is the MVP (Minimum Viable Product) release of the Real Estate Flip Calculator. It allows house flippers to analyze potential investment opportunities with detailed metrics and what-if scenarios.

## Key Features

- **Comprehensive Input Fields**: Enter purchase details, renovation costs, and selling expectations
- **Detailed Renovation Breakdown**: Itemize renovation costs by category
- **Condition-Based Estimator**: Quickly estimate renovation costs based on property condition
- **Interactive Results**: Adjust inputs on the results page to see real-time impacts
- **Professional Lender Report**: Generate detailed PDF-style reports for lenders with what-if analysis

## How to Run the Application Locally

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Access the application at http://localhost:3000

## How to Deploy to GitHub Pages

You can access the live demo at: [Real Estate Flip Calculator](https://babylon77.github.io/real-estate-calculator/)

To deploy the application yourself:

1. Create a new GitHub repository:
   - Go to https://github.com/new
   - Name it "real-estate-calculator"
   - Make it public
   - Click "Create repository"

2. Initialize the repository locally and push your code:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/real-estate-calculator.git
   git push -u origin main
   ```

3. Enable GitHub Pages in your repository:
   - Go to your repository on GitHub
   - Click "Settings" > "Pages"
   - Under "Source", select "gh-pages" branch
   - Click "Save"

4. Update the homepage in package.json with your GitHub username:
   ```json
   "homepage": "https://yourusername.github.io/real-estate-calculator"
   ```

5. Deploy to GitHub Pages:
   ```
   npm run deploy
   ```

6. Alternatively, use the automated GitHub Actions workflow:
   - The workflow will automatically deploy to GitHub Pages whenever you push to the main branch
   - Check the status in the "Actions" tab of your repository

7. After a few minutes, your application will be available at:
   https://yourusername.github.io/real-estate-calculator/

## Providing Feedback

Please provide feedback on:
1. Overall usability and intuitive nature of the interface
2. Accuracy of calculations and metrics
3. Usefulness of the renovation estimator
4. Value of the lender report feature
5. Suggestions for additional features or improvements

## Known Issues in MVP

- Some warning messages during build related to unused imports
- Performance might be slower on very old browsers

## Next Steps

- Address any critical user feedback
- Add property comparison feature
- Implement user accounts for saving calculations
- Add export to spreadsheet functionality
