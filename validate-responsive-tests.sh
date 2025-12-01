#!/bin/bash

# Validation script for responsive design and browser compatibility tests
# Feature: mediapipe-skeleton-overlay, Task 9

echo "🎃 Patternstein - Responsive Design & Browser Compatibility Validation"
echo "======================================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0
WARN=0

# Check if test files exist
echo "${CYAN}Checking test files...${NC}"

if [ -f "test-responsive-compatibility.html" ]; then
    echo "${GREEN}✓${NC} test-responsive-compatibility.html exists"
    ((PASS++))
else
    echo "${RED}✗${NC} test-responsive-compatibility.html missing"
    ((FAIL++))
fi

if [ -f "tests/responsive.compatibility.test.ts" ]; then
    echo "${GREEN}✓${NC} tests/responsive.compatibility.test.ts exists"
    ((PASS++))
else
    echo "${RED}✗${NC} tests/responsive.compatibility.test.ts missing"
    ((FAIL++))
fi

if [ -f "RESPONSIVE_COMPATIBILITY_TEST_GUIDE.md" ]; then
    echo "${GREEN}✓${NC} RESPONSIVE_COMPATIBILITY_TEST_GUIDE.md exists"
    ((PASS++))
else
    echo "${RED}✗${NC} RESPONSIVE_COMPATIBILITY_TEST_GUIDE.md missing"
    ((FAIL++))
fi

if [ -f "BROWSER_COMPATIBILITY_MATRIX.md" ]; then
    echo "${GREEN}✓${NC} BROWSER_COMPATIBILITY_MATRIX.md exists"
    ((PASS++))
else
    echo "${RED}✗${NC} BROWSER_COMPATIBILITY_MATRIX.md missing"
    ((FAIL++))
fi

echo ""
echo "${CYAN}Checking test file content...${NC}"

# Check HTML test file has required elements
if grep -q "test-section" test-responsive-compatibility.html 2>/dev/null; then
    echo "${GREEN}✓${NC} HTML test file has test sections"
    ((PASS++))
else
    echo "${RED}✗${NC} HTML test file missing test sections"
    ((FAIL++))
fi

if grep -q "startCamera" test-responsive-compatibility.html 2>/dev/null; then
    echo "${GREEN}✓${NC} HTML test file has camera controls"
    ((PASS++))
else
    echo "${RED}✗${NC} HTML test file missing camera controls"
    ((FAIL++))
fi

if grep -q "ResizeObserver" test-responsive-compatibility.html 2>/dev/null; then
    echo "${GREEN}✓${NC} HTML test file has ResizeObserver"
    ((PASS++))
else
    echo "${RED}✗${NC} HTML test file missing ResizeObserver"
    ((FAIL++))
fi

# Check TypeScript test file has required tests
if grep -q "Canvas Scaling" tests/responsive.compatibility.test.ts 2>/dev/null; then
    echo "${GREEN}✓${NC} TypeScript tests include Canvas Scaling"
    ((PASS++))
else
    echo "${RED}✗${NC} TypeScript tests missing Canvas Scaling"
    ((FAIL++))
fi

if grep -q "Orientation Support" tests/responsive.compatibility.test.ts 2>/dev/null; then
    echo "${GREEN}✓${NC} TypeScript tests include Orientation Support"
    ((PASS++))
else
    echo "${RED}✗${NC} TypeScript tests missing Orientation Support"
    ((FAIL++))
fi

if grep -q "Performance Considerations" tests/responsive.compatibility.test.ts 2>/dev/null; then
    echo "${GREEN}✓${NC} TypeScript tests include Performance tests"
    ((PASS++))
else
    echo "${RED}✗${NC} TypeScript tests missing Performance tests"
    ((FAIL++))
fi

if grep -q "Browser Compatibility" tests/responsive.compatibility.test.ts 2>/dev/null; then
    echo "${GREEN}✓${NC} TypeScript tests include Browser Compatibility"
    ((PASS++))
else
    echo "${RED}✗${NC} TypeScript tests missing Browser Compatibility"
    ((FAIL++))
fi

echo ""
echo "${CYAN}Checking documentation...${NC}"

# Check guide has required sections
if grep -q "Desktop Browser Testing" RESPONSIVE_COMPATIBILITY_TEST_GUIDE.md 2>/dev/null; then
    echo "${GREEN}✓${NC} Guide includes Desktop Browser Testing"
    ((PASS++))
else
    echo "${RED}✗${NC} Guide missing Desktop Browser Testing"
    ((FAIL++))
fi

if grep -q "Mobile Device Testing" RESPONSIVE_COMPATIBILITY_TEST_GUIDE.md 2>/dev/null; then
    echo "${GREEN}✓${NC} Guide includes Mobile Device Testing"
    ((PASS++))
else
    echo "${RED}✗${NC} Guide missing Mobile Device Testing"
    ((FAIL++))
fi

if grep -q "Screen Size Testing" RESPONSIVE_COMPATIBILITY_TEST_GUIDE.md 2>/dev/null; then
    echo "${GREEN}✓${NC} Guide includes Screen Size Testing"
    ((PASS++))
else
    echo "${RED}✗${NC} Guide missing Screen Size Testing"
    ((FAIL++))
fi

if grep -q "Orientation Change Testing" RESPONSIVE_COMPATIBILITY_TEST_GUIDE.md 2>/dev/null; then
    echo "${GREEN}✓${NC} Guide includes Orientation Testing"
    ((PASS++))
else
    echo "${RED}✗${NC} Guide missing Orientation Testing"
    ((FAIL++))
fi

if grep -q "Performance Testing" RESPONSIVE_COMPATIBILITY_TEST_GUIDE.md 2>/dev/null; then
    echo "${GREEN}✓${NC} Guide includes Performance Testing"
    ((PASS++))
else
    echo "${RED}✗${NC} Guide missing Performance Testing"
    ((FAIL++))
fi

# Check compatibility matrix
if grep -q "Chrome" BROWSER_COMPATIBILITY_MATRIX.md 2>/dev/null; then
    echo "${GREEN}✓${NC} Matrix includes Chrome compatibility"
    ((PASS++))
else
    echo "${RED}✗${NC} Matrix missing Chrome compatibility"
    ((FAIL++))
fi

if grep -q "Firefox" BROWSER_COMPATIBILITY_MATRIX.md 2>/dev/null; then
    echo "${GREEN}✓${NC} Matrix includes Firefox compatibility"
    ((PASS++))
else
    echo "${RED}✗${NC} Matrix missing Firefox compatibility"
    ((FAIL++))
fi

if grep -q "Safari" BROWSER_COMPATIBILITY_MATRIX.md 2>/dev/null; then
    echo "${GREEN}✓${NC} Matrix includes Safari compatibility"
    ((PASS++))
else
    echo "${RED}✗${NC} Matrix missing Safari compatibility"
    ((FAIL++))
fi

if grep -q "iOS Safari" BROWSER_COMPATIBILITY_MATRIX.md 2>/dev/null; then
    echo "${GREEN}✓${NC} Matrix includes iOS Safari compatibility"
    ((PASS++))
else
    echo "${RED}✗${NC} Matrix missing iOS Safari compatibility"
    ((FAIL++))
fi

if grep -q "Android Chrome" BROWSER_COMPATIBILITY_MATRIX.md 2>/dev/null; then
    echo "${GREEN}✓${NC} Matrix includes Android Chrome compatibility"
    ((PASS++))
else
    echo "${RED}✗${NC} Matrix missing Android Chrome compatibility"
    ((FAIL++))
fi

echo ""
echo "${CYAN}Checking requirements coverage...${NC}"

# Check that requirements are referenced
if grep -q "Requirements: 1.5" RESPONSIVE_COMPATIBILITY_TEST_GUIDE.md 2>/dev/null; then
    echo "${GREEN}✓${NC} Requirement 1.5 covered"
    ((PASS++))
else
    echo "${YELLOW}⚠${NC} Requirement 1.5 not explicitly referenced"
    ((WARN++))
fi

if grep -q "Requirements: 2.1" RESPONSIVE_COMPATIBILITY_TEST_GUIDE.md 2>/dev/null; then
    echo "${GREEN}✓${NC} Requirement 2.1 covered"
    ((PASS++))
else
    echo "${YELLOW}⚠${NC} Requirement 2.1 not explicitly referenced"
    ((WARN++))
fi

if grep -q "Requirements: 3.3" RESPONSIVE_COMPATIBILITY_TEST_GUIDE.md 2>/dev/null; then
    echo "${GREEN}✓${NC} Requirement 3.3 covered"
    ((PASS++))
else
    echo "${YELLOW}⚠${NC} Requirement 3.3 not explicitly referenced"
    ((WARN++))
fi

echo ""
echo "======================================================================="
echo "${CYAN}Validation Summary${NC}"
echo "======================================================================="
echo "${GREEN}Passed:${NC} $PASS"
echo "${RED}Failed:${NC} $FAIL"
echo "${YELLOW}Warnings:${NC} $WARN"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "${GREEN}✓ All validation checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Open test-responsive-compatibility.html in different browsers"
    echo "2. Run automated tests: npm test tests/responsive.compatibility.test.ts"
    echo "3. Follow RESPONSIVE_COMPATIBILITY_TEST_GUIDE.md for manual testing"
    echo "4. Review BROWSER_COMPATIBILITY_MATRIX.md for compatibility info"
    exit 0
else
    echo "${RED}✗ Some validation checks failed${NC}"
    echo ""
    echo "Please review the failed checks above and ensure all test files are present."
    exit 1
fi
