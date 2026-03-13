from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time

def scrape_website(url):
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.get(url)
    time.sleep(3)  # Wait for page to load

    # For Hacker News, scrape titles and links
    if "news.ycombinator.com" in url:
        stories = driver.find_elements(By.CSS_SELECTOR, ".titleline > a")
        data = []
        for story in stories:
            title = story.text
            link = story.get_attribute('href')
            data.append({"title": title, "link": link})
    else:
        # Generic scrape, get page title and text
        title = driver.title
        text = driver.find_element(By.TAG_NAME, "body").text
        data = {"title": title, "text": text[:1000]}  # Limit text

    driver.quit()
    return data