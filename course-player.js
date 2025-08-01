// 강의 플레이어 기능 구현

document.addEventListener('DOMContentLoaded', function() {
    // 비디오 플레이어 요소
    const video = document.getElementById('courseVideo');
    const currentTimestamp = document.getElementById('currentTimestamp');
    
    // 사이드바 토글
    const toggleSidebarBtn = document.querySelector('.btn-toggle-sidebar');
    const sidebar = document.querySelector('.player-sidebar');
    
    toggleSidebarBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        const icon = this.querySelector('i');
        if (sidebar.classList.contains('collapsed')) {
            icon.classList.replace('fa-chevron-left', 'fa-chevron-right');
        } else {
            icon.classList.replace('fa-chevron-right', 'fa-chevron-left');
        }
    });
    
    // 탭 전환
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // 모든 탭 비활성화
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // 선택된 탭 활성화
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
    
    // 비디오 재생 시간 업데이트
    if (video) {
        video.addEventListener('timeupdate', function() {
            const minutes = Math.floor(video.currentTime / 60);
            const seconds = Math.floor(video.currentTime % 60);
            currentTimestamp.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        });
    }
    
    // 재생 속도 변경
    const speedBtn = document.querySelector('.btn-speed');
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    let currentSpeedIndex = 2; // 기본값 1x
    
    if (speedBtn && video) {
        speedBtn.addEventListener('click', function() {
            currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
            video.playbackRate = speeds[currentSpeedIndex];
            this.textContent = `${speeds[currentSpeedIndex]}x`;
        });
    }
    
    // 전체화면 토글
    const fullscreenBtn = document.querySelector('.btn-fullscreen');
    if (fullscreenBtn && video) {
        fullscreenBtn.addEventListener('click', function() {
            if (!document.fullscreenElement) {
                video.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });
    }
    
    // 강의 항목 클릭
    const lessonItems = document.querySelectorAll('.lesson-item:not(.locked)');
    lessonItems.forEach(item => {
        item.addEventListener('click', function() {
            // 모든 항목에서 active 클래스 제거
            lessonItems.forEach(i => i.classList.remove('active'));
            
            // 클릭된 항목에 active 클래스 추가
            this.classList.add('active');
            
            // 여기서 실제로는 해당 강의 비디오를 로드하는 로직이 들어가야 함
            console.log('강의 변경:', this.querySelector('.lesson-title').textContent);
        });
    });
    
    // 섹션 접기/펼치기
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const lessonList = this.nextElementSibling;
            lessonList.classList.toggle('collapsed');
        });
    });
    
    // 메모 저장
    const saveNoteBtn = document.querySelector('.btn-save-note');
    const noteText = document.getElementById('noteText');
    const savedNotesContainer = document.querySelector('.saved-notes');
    
    if (saveNoteBtn) {
        saveNoteBtn.addEventListener('click', function() {
            const noteContent = noteText.value.trim();
            if (!noteContent) {
                alert('메모를 입력해주세요.');
                return;
            }
            
            // 새 메모 생성
            const timestamp = currentTimestamp.textContent;
            const date = new Date().toLocaleDateString('ko-KR');
            
            const noteHTML = `
                <div class="note-item">
                    <div class="note-header">
                        <span class="note-time">
                            <i class="fas fa-play-circle"></i> ${timestamp}
                        </span>
                        <span class="note-date">${date}</span>
                    </div>
                    <p class="note-content">${noteContent}</p>
                    <div class="note-actions">
                        <button class="btn-edit-note">수정</button>
                        <button class="btn-delete-note">삭제</button>
                    </div>
                </div>
            `;
            
            // 기존 예제 메모 다음에 추가
            const existingNotes = savedNotesContainer.querySelector('.note-item');
            if (existingNotes) {
                existingNotes.insertAdjacentHTML('afterend', noteHTML);
            } else {
                savedNotesContainer.insertAdjacentHTML('beforeend', noteHTML);
            }
            
            // 입력 필드 초기화
            noteText.value = '';
            
            // 메모 탭으로 스크롤
            savedNotesContainer.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // 메모 삭제 (이벤트 위임)
    if (savedNotesContainer) {
        savedNotesContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-delete-note')) {
                if (confirm('메모를 삭제하시겠습니까?')) {
                    e.target.closest('.note-item').remove();
                }
            }
            
            // 메모 타임스탬프 클릭 시 해당 시간으로 이동
            if (e.target.closest('.note-time')) {
                const timeText = e.target.closest('.note-time').textContent.trim();
                const [minutes, seconds] = timeText.split(' ')[1].split(':').map(Number);
                if (video) {
                    video.currentTime = minutes * 60 + seconds;
                    video.play();
                }
            }
        });
    }
    
    // 질문 등록
    const submitQuestionBtn = document.querySelector('.btn-submit-question');
    if (submitQuestionBtn) {
        submitQuestionBtn.addEventListener('click', function() {
            const questionTextarea = this.previousElementSibling;
            const questionContent = questionTextarea.value.trim();
            
            if (!questionContent) {
                alert('질문을 입력해주세요.');
                return;
            }
            
            alert('질문이 등록되었습니다. 강사님의 답변을 기다려주세요.');
            questionTextarea.value = '';
        });
    }
    
    // 다운로드 버튼
    const downloadBtns = document.querySelectorAll('.btn-download');
    downloadBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const fileName = this.closest('.resource-item').querySelector('h4').textContent;
            alert(`${fileName} 다운로드를 시작합니다.`);
            // 실제로는 여기서 파일 다운로드 로직 구현
        });
    });
    
    // 이전/다음 강의 네비게이션
    const prevBtn = document.querySelector('.btn-prev-lesson');
    const completeBtn = document.querySelector('.btn-complete-lesson');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            console.log('이전 강의로 이동');
            // 실제로는 이전 강의 로드
        });
    }
    
    if (completeBtn) {
        completeBtn.addEventListener('click', function() {
            // 현재 강의 완료 처리
            const activeLesson = document.querySelector('.lesson-item.active');
            if (activeLesson) {
                activeLesson.classList.add('completed');
                activeLesson.classList.remove('active');
                
                const checkbox = activeLesson.querySelector('.lesson-checkbox i');
                checkbox.classList.replace('fa-play-circle', 'fa-check-circle');
                
                // 다음 강의 활성화
                const nextLesson = activeLesson.nextElementSibling;
                if (nextLesson && !nextLesson.classList.contains('locked')) {
                    nextLesson.classList.add('active');
                    const nextCheckbox = nextLesson.querySelector('.lesson-checkbox i');
                    if (nextCheckbox.classList.contains('fa-circle')) {
                        nextCheckbox.classList.replace('fa-circle', 'fa-play-circle');
                    }
                }
                
                // 진도율 업데이트
                updateProgress();
            }
            
            console.log('강의 완료 및 다음 강의로 이동');
        });
    }
    
    // 진도율 업데이트 함수
    function updateProgress() {
        const totalLessons = document.querySelectorAll('.lesson-item:not(.locked)').length;
        const completedLessons = document.querySelectorAll('.lesson-item.completed').length;
        const progressPercent = Math.round((completedLessons / totalLessons) * 100);
        
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${progressPercent}%`;
        }
        
        if (progressText) {
            progressText.textContent = `전체 진도율: ${progressPercent}%`;
        }
        
        // 수료증 버튼 활성화 체크
        if (progressPercent === 100) {
            const certificateBtn = document.querySelector('.btn-certificate');
            if (certificateBtn) {
                certificateBtn.disabled = false;
            }
        }
    }
    
    // 키보드 단축키
    document.addEventListener('keydown', function(e) {
        if (!video) return;
        
        switch(e.key) {
            case ' ': // 스페이스바 - 재생/일시정지
                e.preventDefault();
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
                break;
            case 'ArrowLeft': // 왼쪽 화살표 - 5초 뒤로
                video.currentTime = Math.max(0, video.currentTime - 5);
                break;
            case 'ArrowRight': // 오른쪽 화살표 - 5초 앞으로
                video.currentTime = Math.min(video.duration, video.currentTime + 5);
                break;
            case 'f': // F키 - 전체화면
                if (!document.fullscreenElement) {
                    video.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
                break;
        }
    });
});