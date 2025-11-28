#!/bin/bash

##
# NAVIGATION BUG DEBUGGER - Quick Commands
#
# Script de ayuda rápida para debuggear el bug de navegación
##

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║         🐛 NAVIGATION BUG DEBUGGER v1.0                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

show_menu() {
    echo -e "${YELLOW}Selecciona una opción:${NC}\n"
    echo "  1) 🧪 Ejecutar test de detección (headed)"
    echo "  2) 🎬 Ejecutar test con UI interactiva"
    echo "  3) 🐌 Ejecutar test en slow-motion"
    echo "  4) 🔍 Ejecutar test en modo debug (paso a paso)"
    echo "  5) 📊 Ver último reporte HTML"
    echo "  6) 🎥 Ver videos de tests fallidos"
    echo "  7) 📝 Ver logs de Playwright"
    echo "  8) 🧹 Limpiar reportes antiguos"
    echo "  9) ℹ️  Ver documentación"
    echo "  0) ❌ Salir"
    echo ""
}

run_headed_test() {
    echo -e "${GREEN}🧪 Ejecutando test de detección...${NC}\n"
    npx playwright test navigation-bug-detector --headed --workers=1
    echo -e "\n${GREEN}✅ Test completado!${NC}"
}

run_ui_test() {
    echo -e "${GREEN}🎬 Abriendo UI interactiva de Playwright...${NC}\n"
    npx playwright test navigation-bug-detector --ui
}

run_slowmo_test() {
    echo -e "${GREEN}🐌 Ejecutando test en slow-motion (1s por acción)...${NC}\n"
    # Nota: slow-mo se configura en el test, aquí usamos debug mode
    npx playwright test navigation-bug-detector --headed --workers=1 --timeout=120000
}

run_debug_test() {
    echo -e "${GREEN}🔍 Ejecutando test en modo debug...${NC}"
    echo -e "${YELLOW}Usa 'step over' (F10) para avanzar paso a paso${NC}\n"
    npx playwright test navigation-bug-detector --debug
}

show_report() {
    echo -e "${GREEN}📊 Abriendo reporte HTML...${NC}\n"
    npx playwright show-report
}

show_videos() {
    echo -e "${GREEN}🎥 Buscando videos de tests...${NC}\n"

    if [ -d "test-results" ]; then
        videos=$(find test-results -name "*.webm" 2>/dev/null)

        if [ -z "$videos" ]; then
            echo -e "${YELLOW}No se encontraron videos. Los videos se graban solo cuando los tests fallan.${NC}"
        else
            echo -e "${GREEN}Videos encontrados:${NC}"
            echo "$videos"
            echo ""
            echo -e "${YELLOW}Abre estos archivos con un navegador o reproductor de video${NC}"
        fi
    else
        echo -e "${YELLOW}No existe el directorio test-results${NC}"
    fi
}

show_logs() {
    echo -e "${GREEN}📝 Mostrando últimos logs de Playwright...${NC}\n"

    if [ -d "playwright-report" ]; then
        if [ -f "playwright-report/results.json" ]; then
            echo -e "${CYAN}Resumen del último test:${NC}"
            # Extraer info básica del JSON
            cat playwright-report/results.json | grep -E '"(title|status)"' | head -20
        else
            echo -e "${YELLOW}No se encontró results.json${NC}"
        fi
    else
        echo -e "${YELLOW}No existe el directorio playwright-report${NC}"
    fi

    echo ""
}

clean_reports() {
    echo -e "${YELLOW}¿Estás seguro que quieres eliminar todos los reportes? (y/N)${NC}"
    read -r confirm

    if [[ $confirm == "y" || $confirm == "Y" ]]; then
        echo -e "${GREEN}🧹 Limpiando reportes...${NC}\n"

        rm -rf test-results 2>/dev/null || true
        rm -rf playwright-report 2>/dev/null || true
        rm -rf test-screenshots/*.png 2>/dev/null || true

        echo -e "${GREEN}✅ Reportes limpiados!${NC}"
    else
        echo -e "${YELLOW}Operación cancelada${NC}"
    fi
}

show_docs() {
    echo -e "${GREEN}ℹ️  Abriendo documentación...${NC}\n"

    if [ -f "NAVIGATION_BUG_DEBUGGING_STRATEGY.md" ]; then
        cat NAVIGATION_BUG_DEBUGGING_STRATEGY.md
    else
        echo -e "${RED}❌ No se encontró NAVIGATION_BUG_DEBUGGING_STRATEGY.md${NC}"
    fi
}

# Main loop
while true; do
    show_menu
    read -r choice

    case $choice in
        1)
            run_headed_test
            ;;
        2)
            run_ui_test
            ;;
        3)
            run_slowmo_test
            ;;
        4)
            run_debug_test
            ;;
        5)
            show_report
            ;;
        6)
            show_videos
            ;;
        7)
            show_logs
            ;;
        8)
            clean_reports
            ;;
        9)
            show_docs
            ;;
        0)
            echo -e "${GREEN}👋 Hasta luego!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Opción inválida${NC}\n"
            ;;
    esac

    echo ""
    echo -e "${CYAN}Presiona Enter para continuar...${NC}"
    read -r
    clear
done
