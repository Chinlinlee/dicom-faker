# DICOM Faker

DICOM Faker 是一個用於生成模擬 DICOM 檔案的工具。它可以創建包含隨機但近乎合理的 Patient、Study、Series 和 Instance 資料的 DICOM 檔案。

## 功能特點

- 生成多層級的 DICOM 資料結構(Patient、Study、Series、Instance)
- 使用真實的 DICOM 標籤和 UID
- 生成隨機但近乎合理的病患和醫療資訊
- 創建包含簡單影像資料的 2 幀 DICOM 檔案

## 安裝

1. 複製此儲存庫 (repository)
2. 執行 `pnpm install` 安裝相依套件

## 使用方法

使用以下指令執行程式:
```bash
node index.js [選項]
```

### 選項

- `-p, --patients <number>`: 要生成的病患數量 (預設: 1)
- `-st, --studies <number>`: 每個病患的檢查數量 (預設: 1)
- `-se, --series <number>`: 每個檢查的系列數量 (預設: 1)
- `-in, --instances <number>`: 每個系列的影像數量 (預設: 1)
- `-o, --output <path>`: 輸出目錄路徑 (預設: './dicom')

### 範例

生成 2 個病患，每個病患有 3 個檢查，每個檢查有 2 個系列，每個系列有 5 個影像:
```bash
node index.js -p 2 -st 3 -se 2 -in 5 -o ./output
```


## 專案結構

- `index.js`: 主入口檔案，處理命令列參數
- `patientGenerator.js`: 生成病患資料
- `studyGenerator.js`: 生成檢查資料
- `seriesGenerator.js`: 生成系列資料
- `instanceGenerator.js`: 生成影像資料和 DICOM 檔案
- `jpegGenerator.js`: 生成簡單的 JPEG 影像作為像素資料
- `globalArgs.js`: 儲存全域參數

## 相依套件

主要相依套件包括:

- dcmjs: 用於 DICOM 資料處理
- @faker-js/faker: 生成隨機但合理的資料
- canvas: 創建簡單的影像資料
- commander: 處理命令列參數

完整的相依套件列表請參見 `package.json` 檔案。

## 注意事項

- 生成的 DICOM 檔案僅用於測試和開發目的，不應用於臨床或診斷用途。
- 所有生成的資料都是隨機的，不代表真實的病患資訊。

## 授權條款

本專案採用 MIT 授權條款。

