from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import datetime

# 初始化chromedriver，請將同版本的chromedriver.exe放在程式目錄內
driver = webdriver.Chrome()

# 定義function，傳入股票代號可下載csv檔
def DownloadCsv(stock_id):
    stock_input = driver.find_element(By.ID, 'stk_code')
    stock_input.send_keys(stock_id)
    driver.execute_script('checkForm()')
    driver.execute_script("downloadCSV('BIG5')")

# 開啟櫃買券商買賣日報網站
driver.get("https://www.tpex.org.tw/web/stock/aftertrading/broker_trading/brokerBS.php?l=zh-tw")

# 當reCAPTCHA iframe載入後切換過去
WebDriverWait(driver, 10).until(EC.frame_to_be_available_and_switch_to_it((By.XPATH, "//iframe[starts-with(@name, 'a-') and starts-with(@src, 'https://www.google.com/recaptcha')]")))
# 勾選"我不是機器人"
WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.CSS_SELECTOR, "div.rc-anchor-content"))).click()

input("通過驗證後按Enter繼續")

# 切換回主frame
driver.switch_to.default_content()
# 要下載的csv檔在下方呼叫DownloadCsv
DownloadCsv('4743')
DownloadCsv('4128')
DownloadCsv('6679')

# 下載興櫃資料
driver.get("https://www.tpex.org.tw/web/emergingstock/historical/daily/EMDaily_dl.php?l=zh-tw&f=EMdss004." + datetime.date.today().strftime('%Y%m%d') + "-C.csv")

input('按Enter結束')
# 關閉chrome
driver.quit()