from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()

def DownloadCsv(stock_id):
    stock_input = driver.find_element(By.ID, 'stk_code')
    stock_input.send_keys(stock_id)
    driver.execute_script('checkForm()')
    driver.execute_script("downloadCSV('BIG5')")

driver.get("https://www.tpex.org.tw/web/stock/aftertrading/broker_trading/brokerBS.php?l=zh-tw")

WebDriverWait(driver, 10).until(EC.frame_to_be_available_and_switch_to_it((By.XPATH, "//iframe[starts-with(@name, 'a-') and starts-with(@src, 'https://www.google.com/recaptcha')]")))
WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.CSS_SELECTOR, "div.rc-anchor-content"))).click()

input("通過驗證後按Enter繼續")

driver.switch_to.default_content()
DownloadCsv('4743')
DownloadCsv('4128')
DownloadCsv('6679')

input('按Enter結束')
driver.quit()