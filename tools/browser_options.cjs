// Use Playwright's pinned Chromium by default; an explicit local browser is optional.
module.exports={headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})};
