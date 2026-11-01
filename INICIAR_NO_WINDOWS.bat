@echo off
cd /d "%~dp0backend"
echo ============================================
echo   DOCE ENCANTO V4.3 - CLIENTE + ADMIN + CONVERSAS
 echo ============================================
if not exist ".env" (
 echo ERRO: copie o .env antigo para a pasta backend desta versao.
 echo Veja o COMECE_AQUI.md para as instrucoes completas.
 pause
 exit /b 1
)
if not exist "node_modules" (
 echo Instalando dependencias do Node.js...
 call npm.cmd install
 if errorlevel 1 (pause & exit /b 1)
)
echo Preparando banco (sem apagar registros existentes)...
call npm.cmd run db:setup
if errorlevel 1 (pause & exit /b 1)
echo.
echo LOJA: http://localhost:3000/
echo ADMIN: http://localhost:3000/admin.html
echo AVISOS E RESPOSTAS: abra Recados e ajuda e escolha o pedido.
echo PIX: selecione Pix no checkout e registre um pedido.
echo Nao e um Pix bancario. Nenhuma cobranca real.
echo Se ainda nao criou as contas demo, encerre com Ctrl+C e rode:
echo npm.cmd run demo:users
call npm.cmd run dev
pause
