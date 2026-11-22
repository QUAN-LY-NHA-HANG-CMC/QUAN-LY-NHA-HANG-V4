@echo off
chcp 65001 >nul
echo ========================================================
echo   DỰ ÁN QUẢN LÝ NHÀ HÀNG QUÁN MỘC POS
echo   TIỆN ÍCH ĐÓNG LOCALHOST VÀ GIẢI PHÓNG CỔNG 3001
echo ========================================================
echo.
node "%~dp0scripts\giaiPhongCong.js"
echo.
pause
