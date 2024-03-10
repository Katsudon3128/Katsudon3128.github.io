import openpyxl
import csv
import os

wb = openpyxl.Workbook()

def transCsvDataToXlsx(fileName):
    file = open(fileName)
    reader = csv.reader(file)
    data_list = list(reader)
    file.close()

    stockId = data_list[1][1].replace('=','').replace('"','')
    wb.create_sheet(stockId)
    resultSheet = wb[stockId]

    # 寫入欄位名稱
    resultSheet.cell(1,1,data_list[2][0])
    resultSheet.cell(1,2,data_list[2][1])
    resultSheet.cell(1,3,data_list[2][2])
    resultSheet.cell(1,4,data_list[2][3])
    resultSheet.cell(1,5,data_list[2][4])

    n=1
    for i in range(3,len(data_list)):
        n+=1
        resultSheet.cell(n,1,data_list[i][0]).data_type = 'int'
        resultSheet.cell(n,2,data_list[i][1])
        resultSheet.cell(n,3,data_list[i][2]).data_type = 'int'
        resultSheet.cell(n,4,data_list[i][3].replace(',','')).data_type = 'int'
        resultSheet.cell(n,5,data_list[i][4].replace(',','')).data_type = 'int'
        
        # 如果這列有兩筆資料，就寫入
        if len(data_list[i]) == 11:
            n+=1
            resultSheet.cell(n,1,data_list[i][6]).data_type = 'int'
            resultSheet.cell(n,2,data_list[i][7])
            resultSheet.cell(n,3,data_list[i][8]).data_type = 'int'
            resultSheet.cell(n,4,data_list[i][9].replace(',','')).data_type = 'int'
            resultSheet.cell(n,5,data_list[i][10].replace(',','')).data_type = 'int'

#轉檔
dir = os.listdir()

for file in dir:
    if file.split('.')[1].upper() == 'CSV':
        transCsvDataToXlsx(file)

wb.save('result.xlsx')
