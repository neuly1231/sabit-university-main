document.addEventListener('DOMContentLoaded', function() {
    // 메뉴와 콘텐츠 동적 생성
    generateMenuAndContent();
    
    // 스크롤 이벤트 처리
    handleScrollEvents();
    
    // 모바일 메뉴 토글 기능 초기화
    initMobileMenuToggle();
    
    // 업데이트 모달 생성
    createUpdateModal();
    
    // 첫 방문 확인 및 업데이트 공지 표시
    checkFirstVisit();
});

// JSON 데이터로부터 메뉴와 콘텐츠 생성
function generateMenuAndContent() {
    const tocElement = document.getElementById('toc');
    const mainContentElement = document.getElementById('main-content');
    
    if (!tocElement || !mainContentElement || !websiteData || !websiteData.menus) {
        console.error('필요한 요소 또는 데이터가 없습니다.');
        return;
    }
    
    // 메뉴와 콘텐츠 HTML 생성
    let tocHTML = '';
    let contentHTML = '';
    
    // 메뉴 데이터 반복
    websiteData.menus.forEach(menu => {
        // 대메뉴 섹션 추가
        tocHTML += `
            <div class="toc-section">
                <div class="toc-header">${menu.title}</div>
                <ul>
        `;
        
        // 하위 메뉴 추가
        menu.submenus.forEach(submenu => {
            if (submenu.title.trim() === '') return;

            // 필독 중 '주의사항'과 '공통 규칙'은 접지 않음
            const isAlwaysOpen = (menu.id === "essential" && ["주의사항", "공통 규칙"].includes(submenu.title));

            tocHTML += `<li><a href="#${submenu.id}">${submenu.title}</a></li>`;

            contentHTML += `
                <section id="${submenu.id}" class="doc-section">
                    <h2 class="toggle-header" data-target="${submenu.id}">${submenu.title}
                        <span class="toggle-icon">${isAlwaysOpen ? "" : "▶"}</span>
                    </h2>
                    <div class="content ${isAlwaysOpen ? '' : 'collapsed'}">
                        <p>${submenu.content}</p>
                    </div>
                </section>
            `;
        });
    });
    
    // HTML 삽입
    tocElement.innerHTML = tocHTML;
    mainContentElement.innerHTML = contentHTML;
    
    // 메뉴 클릭 이벤트 설정
    setupMenuClickEvents();
    
    // generateMenuAndContent() 끝에 추가
    document.querySelectorAll('.toggle-header').forEach(header => {
        const title = header.textContent.trim();
        const isAlwaysOpen = ["주의사항", "공통 규칙"].some(t => title.includes(t)); // 제목 기준 검사

        if (!isAlwaysOpen) {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                if (!content.classList.contains('collapsed')) {
                    content.classList.add('collapsed');
                    header.querySelector('.toggle-icon').textContent = '▶';
                } else {
                    content.classList.remove('collapsed');
                    header.querySelector('.toggle-icon').textContent = '▼';
                    content.setAttribute('data-manual', 'true');
                }
            });
        }
    });


}

// 메뉴 클릭 이벤트 설정
function setupMenuClickEvents() {
    const links = document.querySelectorAll('.toc a');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                // 모든 링크 비활성화
                links.forEach(link => link.classList.remove('active'));
                this.classList.add('active');

                // 섹션 하이라이트 초기화
                document.querySelectorAll('.doc-section').forEach(section => {
                    section.classList.remove('highlight');
                });

                // 👉 스크롤 이동 유지
                window.scrollTo({
                    top: targetSection.offsetTop - 90,
                    behavior: 'smooth'
                });

                // 하이라이트 적용
                targetSection.classList.add('highlight');
                setTimeout(() => {
                    targetSection.classList.remove('highlight');
                }, 2000);

                // ✅ 자동 펼침 처리 추가
                const content = targetSection.querySelector('.content');
                const icon = targetSection.querySelector('.toggle-icon');
                if (content && content.classList.contains('collapsed')) {
                    content.classList.remove('collapsed');
                    if (icon) icon.textContent = '▼';
                }

                // 모바일일 경우 메뉴 닫기
                if (window.innerWidth <= 900) {
                    closeMobileMenu();
                }
            }
        });
    });
}


// 스크롤 이벤트 처리
function handleScrollEvents() {
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        const sections = document.querySelectorAll('.doc-section');
        const links = document.querySelectorAll('.toc a');
        
        // 현재 보이는 섹션 찾기
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= (sectionTop - 100) && 
                scrollPosition < (sectionTop + sectionHeight - 100)) {
                currentSection = section.getAttribute('id');
            }
        });
        
        // 해당 메뉴 활성화
        if (currentSection) {
            links.forEach(link => {
                link.classList.remove('active');
                
                if (link.getAttribute('href') === `#${currentSection}`) {
                    link.classList.add('active');
                }
            });
        }
    });
    
    // 초기 로드 시 현재 보이는 섹션에 대한 메뉴 활성화
    setTimeout(() => {
        window.dispatchEvent(new Event('scroll'));
    }, 200);
}

// 모바일 메뉴 열기
function openMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    const toggleButton = document.querySelector('.mobile-menu-toggle');
    
    sidebar.classList.add('open');
    overlay.classList.add('active');
    toggleButton.innerHTML = '✕';
    
    // body 스크롤 방지
    document.body.style.overflow = 'hidden';
}

// 모바일 메뉴 닫기
function closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    const toggleButton = document.querySelector('.mobile-menu-toggle');
    
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    toggleButton.innerHTML = '☰';
    
    // body 스크롤 복원
    document.body.style.overflow = '';
}

// 모바일 메뉴 토글 및 헤더 버튼 초기화
function initMobileMenuToggle() {
    const header = document.querySelector('header');
    
    // 1. 헤더 컨트롤 그룹 생성 (모든 버튼을 담을 컨테이너)
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'header-controls';
    
    // 2. 버전 정보 버튼 생성
    const versionButton = document.createElement('button');
    versionButton.className = 'version-button';
    versionButton.textContent = websiteData.updateInfo.version;
    versionButton.setAttribute('aria-label', '업데이트 정보');
    versionButton.addEventListener('click', openUpdateModal);
    
    // 3. 설정 버튼 생성
    const settingsButton = document.createElement('button');
    settingsButton.className = 'settings-button';
    settingsButton.innerHTML = '<i class="fas fa-cog"></i>';
    settingsButton.setAttribute('aria-label', '설정');
    settingsButton.addEventListener('click', openSettingsModal);
    
    // 4. 모바일 토글 버튼 생성
    const toggleButton = document.createElement('button');
    toggleButton.className = 'mobile-menu-toggle';
    toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
    toggleButton.setAttribute('aria-label', '메뉴 토글');
    toggleButton.addEventListener('click', function() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar.classList.contains('open')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    // 5. 버튼들을 컨트롤 그룹에 순서대로 추가 (여기가 핵심!)
    controlsDiv.appendChild(versionButton);
    controlsDiv.appendChild(settingsButton);
    controlsDiv.appendChild(toggleButton); // ★ 햄버거 메뉴도 같은 그룹에 넣음
    
    // 6. 헤더에 컨트롤 그룹 추가
    header.appendChild(controlsDiv);
    
    // 오버레이 생성
    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    document.body.appendChild(overlay);
    
    overlay.addEventListener('click', closeMobileMenu);
    
    // 모달 닫기 이벤트들
    document.addEventListener('click', function(e) {
        const modal = document.getElementById('settings-modal');
        const updateModal = document.getElementById('update-modal');
        if (e.target === modal) closeSettingsModal();
        if (e.target === updateModal) closeUpdateModal();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('settings-modal');
            if (modal && modal.classList.contains('active')) closeSettingsModal();
            const updateModal = document.getElementById('update-modal');
            if (updateModal && updateModal.classList.contains('active')) closeUpdateModal();
        }
    });
    
    window.addEventListener('resize', function() {
        if (window.innerWidth > 900) closeMobileMenu();
    });

    // 설정 모달 생성 호출
    createSettingsModal();
}

// 설정 모달 생성
function createSettingsModal() {
    const modalHTML = `
        <div id="settings-modal" class="modal-overlay">
            <div class="settings-modal">
                <div class="modal-header">
                    <h3 class="modal-title">설정</h3>
                    <button class="close-button" onclick="closeSettingsModal()">&times;</button>
                </div>
                <div class="theme-section">
                    <h4 class="section-title">테마</h4>
                    <div class="theme-buttons">
                        <button class="theme-button active" data-theme="default">라이트</button>
                        <button class="theme-button" data-theme="dark">다크</button>
                        <button class="theme-button" data-theme="pink">핑크</button>
                        <button class="theme-button" data-theme="avocado">아보카도</button>
                        <button class="theme-button" data-theme="ocean">오션</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 테마 버튼 이벤트 설정
    setupThemeButtons();
    
    // 저장된 테마 적용
    loadSavedTheme();
}

// 설정 모달 열기
function openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 설정 모달 닫기
function closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// 테마 버튼 이벤트 설정
function setupThemeButtons() {
    const themeButtons = document.querySelectorAll('.theme-button');
    
    themeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            
            // 활성 버튼 변경
            themeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 테마 적용
            applyTheme(theme);
            
            // 테마 저장
            saveTheme(theme);
        });
    });
}

// 테마 적용
function applyTheme(theme) {
    // 기존 테마 클래스 제거
    document.body.classList.remove('theme-dark', 'theme-pink', 'theme-avocado', 'theme-ocean');
    
    // 새 테마 적용
    if (theme !== 'default') {
        document.body.classList.add(`theme-${theme}`);
    }
}

function saveTheme(theme) {
    document.cookie = `theme=${theme}; path=/; max-age=31536000`;
}

// 저장된 테마 불러오기 함수
function loadSavedTheme() {
    // 쿠키에서 테마 읽기
    const cookies = document.cookie.split(';');
    let savedTheme = 'default';
    
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'theme') {
            savedTheme = value;
            break;
        }
    }
    
    const themeButtons = document.querySelectorAll('.theme-button');
    
    // 저장된 테마에 해당하는 버튼 활성화
    themeButtons.forEach(button => {
        if (button.getAttribute('data-theme') === savedTheme) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // 테마 적용
    applyTheme(savedTheme);
}

// 업데이트 모달 생성
function createUpdateModal() {
    const modalHTML = `
        <div id="update-modal" class="modal-overlay">
            <div class="update-modal">
                <div class="update-header">
                    <h3 class="update-title">업데이트 정보 ${websiteData.updateInfo.version}</h3>
                    <button class="close-button" onclick="closeUpdateModal()">&times;</button>
                </div>
                <div class="update-date">${websiteData.updateInfo.date}</div>
                <div class="update-content">${websiteData.updateInfo.content}</div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// 업데이트 모달 열기
function openUpdateModal() {
    const modal = document.getElementById('update-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 업데이트 모달 닫기
function closeUpdateModal() {
    const modal = document.getElementById('update-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // 쿠키에 현재 버전 저장 (다음에 자동으로 안 뜨게)
    document.cookie = `lastSeenVersion=${websiteData.updateInfo.version}; path=/; max-age=31536000`;
}

// 첫 방문 시 업데이트 공지 확인
function checkFirstVisit() {
    const cookies = document.cookie.split(';');
    let lastSeenVersion = null;
    
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'lastSeenVersion') {
            lastSeenVersion = value;
            break;
        }
    }
    
    // 처음 방문이거나 새 버전인 경우 모달 표시 (중복 방지)
    if (!lastSeenVersion || lastSeenVersion !== websiteData.updateInfo.version) {
        // 이미 모달이 표시되었는지 확인
        const modal = document.getElementById('update-modal');
        if (modal && !modal.classList.contains('active')) {
            setTimeout(() => {
                // 다시 한번 확인하여 중복 방지
                if (!modal.classList.contains('active')) {
                    openUpdateModal();
                }
            }, 500); // 0.5초 후 표시
        }
    }
}