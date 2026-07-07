/**
 * 러브레터 - 모바일 청첩장 빌더 로직 (app.js)
 */

(function () {
  'use strict';

  // ─── 애플리케이션 상태 관리 (State) ───
  const state = {
    theme: 'warm',
    effectPetals: true,
    effectCurtain: true,
    metaTitle: '신랑 ♥ 신부의 모바일 청첩장',
    metaDesc: '소중한 분들을 초대합니다. 꼭 오셔서 축하해 주세요.',
    
    groom: {
      name: '이몽룡',
      phone: '010-1234-5678',
      father: '이한림',
      fatherDeceased: false,
      mother: '향단이',
      motherDeceased: false,
      accounts: [
        { role: '신랑', bank: '신한은행', number: '110-123-456789' },
        { role: '혼주(부)', bank: '국민은행', number: '043-21-098765' }
      ]
    },
    
    bride: {
      name: '성춘향',
      phone: '010-5678-1234',
      father: '성참판',
      fatherDeceased: false,
      mother: '월매',
      motherDeceased: false,
      accounts: [
        { role: '신부', bank: '우리은행', number: '1002-987-654321' },
        { role: '혼주(모)', bank: '하나은행', number: '123-456789-01205' }
      ]
    },
    
    wedding: {
      date: '2026-10-24',
      time: '12:30',
      venue: '사랑웨딩 컨벤션 3층 그랜드홀',
      address: '서울시 중구 세종대로 110',
      mapLinks: {
        kakao: 'https://map.kakao.com/?urlX=506223&urlY=1130955&name=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%EC%B2%AD',
        naver: 'https://map.naver.com/v5/entry/place/11584428'
      }
    },
    
    story: {
      title: '소중한 분들을 초대합니다',
      content: `서로 다른 색으로 살아온 두 사람이\n이제 하나의 그림을 그려가려 합니다.\n\n저희의 새로운 시작을 함께해 주시고\n축업해 주시면 감사하겠습니다.\n\n소중한 걸음으로 자리를 빛내주시기 바랍니다.`
    },
    
    images: {
      hero: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
      story: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=400'
      ],
      location: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600'
    }
  };

  // ─── DOM 셀렉터 단축 ───
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ─── 탭 전환 구현 ───
  function initTabs() {
    const tabs = $$('.tab-btn');
    const contents = $$('.tab-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        const targetId = tab.dataset.tab;
        $(`#${targetId}`).classList.add('active');
      });
    });
  }

  // ─── 디바이스 토글 및 제어 ───
  function initDeviceControls() {
    const wrapper = $('#device-wrapper');
    
    $('#btn-view-mobile').addEventListener('click', (e) => {
      $('.toolbar-btn').classList.remove('active');
      $('#btn-view-mobile').classList.add('active');
      wrapper.className = 'device-container';
    });

    $('#btn-view-tablet').addEventListener('click', (e) => {
      $$('.toolbar-btn').forEach(btn => btn.classList.remove('active'));
      $('#btn-view-tablet').classList.add('active');
      wrapper.className = 'device-container view-tablet';
    });

    $('#btn-reset-curtain').addEventListener('click', () => {
      const iframe = $('#preview-iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ action: 'reset-curtain' }, '*');
      }
    });
  }

  // ─── 폼 입력 필드 바인딩 ───
  function bindFormInputs() {
    // 텍스트 & 날짜 필드 맵
    const inputMappings = [
      { id: '#meta-title', key: 'metaTitle' },
      { id: '#meta-desc', key: 'metaDesc' },
      { id: '#groom-name', key: 'groom.name' },
      { id: '#groom-phone', key: 'groom.phone' },
      { id: '#groom-father', key: 'groom.father' },
      { id: '#groom-mother', key: 'groom.mother' },
      { id: '#bride-name', key: 'bride.name' },
      { id: '#bride-phone', key: 'bride.phone' },
      { id: '#bride-father', key: 'bride.father' },
      { id: '#bride-mother', key: 'bride.mother' },
      { id: '#story-title', key: 'story.title' },
      { id: '#story-content', key: 'story.content' },
      { id: '#wedding-date', key: 'wedding.date' },
      { id: '#wedding-time', key: 'wedding.time' },
      { id: '#wedding-venue', key: 'wedding.venue' },
      { id: '#wedding-address', key: 'wedding.address' },
      { id: '#map-kakao', key: 'wedding.mapLinks.kakao' },
      { id: '#map-naver', key: 'wedding.mapLinks.naver' }
    ];

    // 상태 객체 깊은 업데이트 함수
    function setNestedKey(obj, path, value) {
      const parts = path.split('.');
      let current = obj;
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
    }

    inputMappings.forEach(mapping => {
      const input = $(mapping.id);
      if (input) {
        input.addEventListener('input', () => {
          setNestedKey(state, mapping.key, input.value);
          updatePreview();
        });
      }
    });

    // 체크박스 바인딩 (고인 표시 및 연출 효과)
    const checkboxes = [
      { id: '#groom-father-deceased', key: 'groom.fatherDeceased' },
      { id: '#groom-mother-deceased', key: 'groom.motherDeceased' },
      { id: '#bride-father-deceased', key: 'bride.fatherDeceased' },
      { id: '#bride-mother-deceased', key: 'bride.motherDeceased' },
      { id: '#effect-petals', key: 'effectPetals' },
      { id: '#effect-curtain', key: 'effectCurtain' }
    ];

    checkboxes.forEach(mapping => {
      const checkbox = $(mapping.id);
      if (checkbox) {
        checkbox.addEventListener('change', () => {
          setNestedKey(state, mapping.key, checkbox.checked);
          updatePreview(true); // 구조 변경이므로 전체 리로드
        });
      }
    });

    // 테마 선택기
    const themeCards = $$('.theme-card');
    themeCards.forEach(card => {
      const radio = card.querySelector('input');
      card.addEventListener('click', () => {
        themeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        radio.checked = true;
        state.theme = radio.value;
        updatePreview(true); // 테마 변경은 CSS 로드가 필요하므로 리로드
      });
    });
  }

  // ─── 이미지 URL 입력 바인딩 ───
  function bindImageUrlInputs() {
    const urlInputs = [
      { id: '#img-url-hero', type: 'hero' },
      { id: '#img-url-story', type: 'story' },
      { id: '#img-url-location', type: 'location' }
    ];

    urlInputs.forEach(item => {
      const input = $(item.id);
      if (input) {
        input.addEventListener('input', () => {
          const url = input.value.trim();
          state.images[item.type] = url;
          
          // 업로드 박스 미리보기 갱신
          const dropzone = $(`#dropzone-${item.type}`);
          const prompt = dropzone.querySelector('.upload-prompt');
          const thumb = dropzone.querySelector('.thumbnail-preview');
          if (url) {
            prompt.classList.add('hidden');
            thumb.classList.remove('hidden');
            thumb.querySelector('img').src = url;
          } else {
            prompt.classList.remove('hidden');
            thumb.classList.add('hidden');
            thumb.querySelector('img').src = '';
          }
          
          updatePreview(true);
        });
      }
    });

    // 갤러리 URL 처리
    const galleryInput = $('#img-url-gallery');
    if (galleryInput) {
      galleryInput.addEventListener('input', () => {
        const val = galleryInput.value.trim();
        if (val) {
          state.images.gallery = val.split(',').map(url => url.trim()).filter(url => url.length > 0);
        } else {
          state.images.gallery = [];
        }
        renderGalleryThumbs();
        updatePreview(true);
      });
    }
  }

  // ─── 계좌 관리 기능 ───
  function initAccountsManager() {
    // 렌더링 함수
    function renderAccountsEdit(side) {
      const container = $(`#${side}-accounts-list`);
      container.innerHTML = '';
      
      state[side].accounts.forEach((acc, index) => {
        const row = document.createElement('div');
        row.className = 'account-edit-row';
        row.innerHTML = `
          <input type="text" class="acc-role" value="${acc.role}" placeholder="관계" data-field="role">
          <input type="text" class="acc-bank" value="${acc.bank}" placeholder="은행명" data-field="bank">
          <input type="text" class="acc-num" value="${acc.number}" placeholder="계좌번호" data-field="number">
          <button type="button" class="btn-delete-account" title="삭제"><i class="fa-solid fa-trash-can"></i></button>
        `;

        // 실시간 변경 바인딩
        row.querySelectorAll('input').forEach(input => {
          input.addEventListener('input', (e) => {
            const field = e.target.dataset.field;
            state[side].accounts[index][field] = e.target.value;
            updatePreview();
          });
        });

        // 삭제 이벤트
        row.querySelector('.btn-delete-account').addEventListener('click', () => {
          state[side].accounts.splice(index, 1);
          renderAccountsEdit(side);
          updatePreview(true);
        });

        container.appendChild(row);
      });
    }

    // 초기 렌더링
    renderAccountsEdit('groom');
    renderAccountsEdit('bride');

    // 계좌 추가 버튼 바인딩
    $$('.btn-add-account').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        state[target].accounts.push({ role: '관계명', bank: '은행명', number: '계좌번호' });
        renderAccountsEdit(target);
        updatePreview(true); // 아코디언 목록 돔 갱신
      });
    });
  }

  // ─── 이미지 업로드 처리 ───
  function initImageUploads() {
    const uploadTypes = [
      { id: 'hero', dropzone: '#dropzone-hero', input: '#upload-hero' },
      { id: 'story', dropzone: '#dropzone-story', input: '#upload-story' },
      { id: 'location', dropzone: '#dropzone-location', input: '#upload-location' }
    ];

    uploadTypes.forEach(type => {
      const dropzone = $(type.dropzone);
      const input = $(type.input);

      // 클릭 시 업로드 활성화
      dropzone.addEventListener('click', (e) => {
        if (e.target.closest('.btn-remove-img')) return;
        input.click();
      });

      // 드래그 & 드롭 클래스
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
      });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
          handleFileSelect(e.dataTransfer.files[0], type.id, dropzone);
        }
      });

      // 파일 탐색기 선택
      input.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          handleFileSelect(e.target.files[0], type.id, dropzone);
        }
      });
    });

    // 갤러리 다중 업로드 특수 처리
    const galleryDropzone = $('#dropzone-gallery');
    const galleryInput = $('#upload-gallery');

    galleryDropzone.addEventListener('click', (e) => {
      galleryInput.click();
    });
    galleryDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      galleryDropzone.classList.add('dragover');
    });
    galleryDropzone.addEventListener('dragleave', () => {
      galleryDropzone.classList.remove('dragover');
    });
    galleryDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      galleryDropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        handleGalleryFiles(e.dataTransfer.files);
      }
    });
    galleryInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleGalleryFiles(e.target.files);
      }
    });

    // 이미지 삭제 딜리게이트
    document.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('.btn-remove-img');
      if (!removeBtn) return;
      const type = removeBtn.dataset.type;
      
      state.images[type] = ''; // 상태 제거
      
      const dropzone = $(`#dropzone-${type}`);
      const prompt = dropzone.querySelector('.upload-prompt');
      const thumb = dropzone.querySelector('.thumbnail-preview');
      
      prompt.classList.remove('hidden');
      thumb.classList.add('hidden');
      thumb.querySelector('img').src = '';
      
      updatePreview(true);
    });
  }

  // 단일 파일 기저64 변환
  function handleFileSelect(file, type, dropzone) {
    if (!file.type.match('image.*')) {
      showToast('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const dataUrl = e.target.result;
      state.images[type] = dataUrl;

      // 썸네일 노출
      const prompt = dropzone.querySelector('.upload-prompt');
      const thumb = dropzone.querySelector('.thumbnail-preview');
      prompt.classList.add('hidden');
      thumb.classList.remove('hidden');
      thumb.querySelector('img').src = dataUrl;

      updatePreview(true);
    };
    reader.readAsDataURL(file);
  }

  // 갤러리 다중 파일 처리
  function handleGalleryFiles(files) {
    let loadedCount = 0;
    const totalFiles = files.length;
    
    // 만약 기본 Unsplash 이미지가 들어있는 상태에서 새로 올린다면 교체
    if (state.images.gallery.length > 0 && state.images.gallery[0].startsWith('http')) {
      state.images.gallery = [];
    }

    Array.from(files).forEach(file => {
      if (!file.type.match('image.*')) return;

      const reader = new FileReader();
      reader.onload = function (e) {
        state.images.gallery.push(e.target.result);
        loadedCount++;
        
        if (loadedCount === totalFiles || loadedCount === Array.from(files).filter(f => f.type.match('image.*')).length) {
          renderGalleryThumbs();
          updatePreview(true);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // 갤러리 썸네일 그리기
  function renderGalleryThumbs() {
    const container = $('#gallery-thumbs-container');
    container.innerHTML = '';

    state.images.gallery.forEach((src, index) => {
      const wrap = document.createElement('div');
      wrap.className = 'gallery-thumb-wrapper';
      wrap.innerHTML = `
        <img src="${src}" alt="갤러리 썸네일">
        <button class="btn-delete-gallery-thumb" data-index="${index}"><i class="fa-solid fa-xmark"></i></button>
      `;

      wrap.querySelector('.btn-delete-gallery-thumb').addEventListener('click', (e) => {
        e.stopPropagation();
        state.images.gallery.splice(index, 1);
        renderGalleryThumbs();
        updatePreview(true);
      });

      container.appendChild(wrap);
    });
  }

  // ─── 토스트 팝업 ───
  function showToast(msg) {
    const toast = $('#builder-toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // ─── 실시간 프리뷰 돔 동기화 ───
  let updateTimeout = null;

  function updatePreview(forceReload = false) {
    const iframe = $('#preview-iframe');
    if (!iframe) return;

    if (forceReload || !iframe.dataset.initialized) {
      // 강제 리로드 또는 최초 로드 시 srcdoc 작성
      const html = generateInvitationHtml(state);
      iframe.srcdoc = html;
      iframe.dataset.initialized = 'true';
    } else {
      // 디바운스를 활용해 가볍게 돔 엘리먼트 값들만 포스트 메시지 혹은 직접 동기화 실행
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow.document;
          if (doc) {
            // 인적 정보 업데이트
            const g = state.groom;
            const b = state.bride;
            const w = state.wedding;
            
            const gNames = doc.querySelectorAll('.groom-name-txt');
            gNames.forEach(el => el.textContent = g.name);
            
            const bNames = doc.querySelectorAll('.bride-name-txt');
            bNames.forEach(el => el.textContent = b.name);
            
            // 날짜 및 일정 정보 갱신
            const timeEl = doc.getElementById('preview-date-time');
            if (timeEl) {
              timeEl.textContent = formatDateTimeString(w.date, w.time);
            }
            
            const venueEl = doc.getElementById('preview-venue-name');
            if (venueEl) venueEl.textContent = w.venue;
            
            const addrEl = doc.getElementById('preview-address');
            if (addrEl) addrEl.textContent = w.address;

            // 초대글 업데이트
            const stTitle = doc.getElementById('preview-story-title');
            if (stTitle) stTitle.textContent = state.story.title;
            const stContent = doc.getElementById('preview-story-content');
            if (stContent) stContent.textContent = state.story.content;
            
            // 지도 링크
            const kBtn = doc.getElementById('preview-kakao-btn');
            if (kBtn) kBtn.href = w.mapLinks.kakao;
            const nBtn = doc.getElementById('preview-naver-btn');
            if (nBtn) nBtn.href = w.mapLinks.naver;

            // 디데이 카운트다운 대상 시간 전달
            iframe.contentWindow.postMessage({
              action: 'update-state',
              date: w.date,
              time: w.time,
              groomName: g.name,
              brideName: b.name,
              venue: w.venue,
              address: w.address
            }, '*');
          }
        } catch (e) {
          console.warn('Iframe DOM direct sync fail, fallback to srcdoc reload.', e);
          iframe.srcdoc = generateInvitationHtml(state);
        }
      }, 50);
    }
  }

  // ─── 캘린더용 날짜 문자열 변환 ───
  function formatDateTimeString(dateStr, timeStr) {
    const d = new Date(`${dateStr}T${timeStr}:00`);
    if (isNaN(d.getTime())) return '';
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    const day = days[d.getDay()];
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const period = hours < 12 ? '오전' : '오후';
    const h12 = hours % 12 || 12;
    const minStr = String(minutes).padStart(2, '0');
    return `${year}년 ${month}월 ${date}일 (${day}) ${period} ${h12}시 ${minStr}분`;
  }

  // ─── 단일 HTML 파일 포장기 ───
  function generateInvitationHtml(data) {
    const petalStyles = data.effectPetals ? `
    /* 벚꽃 잎 날림 스타일 */
    .petals-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 99;
      pointer-events: none;
      overflow: hidden;
    }
    .petal {
      position: absolute;
      background: linear-gradient(135deg, #ffd3e2 0%, #ffb6c1 100%);
      border-radius: 50% 0 50% 50%;
      opacity: 0.8;
      pointer-events: none;
      animation: fall linear forwards;
    }
    @keyframes fall {
      0% {
        transform: translateY(-20px) rotate(0deg) skewX(0deg);
        opacity: 0;
      }
      10% {
        opacity: 0.8;
      }
      90% {
        opacity: 0.8;
      }
      100% {
        transform: translateY(105vh) rotate(540deg) skewX(20deg);
        opacity: 0;
      }
    }
    ` : '';

    const curtainStyles = data.effectCurtain ? `
    /* 커튼 인트로 효과 */
    .curtain-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      display: flex;
      pointer-events: none;
      transition: opacity 0.5s ease;
    }
    .curtain {
      width: 50%;
      height: 100%;
      background: repeating-linear-gradient(
        90deg,
        #fbf9f6 0px,
        #f5f1ea 15px,
        #fbf9f6 30px,
        #efeae0 45px,
        #fbf9f6 60px
      );
      box-shadow: inset 0 0 40px rgba(0,0,0,0.04);
      transition: transform 1.2s cubic-bezier(0.77, 0, 0.175, 1);
    }
    .curtain-left {
      border-right: 1px solid rgba(0,0,0,0.08);
      transform-origin: left;
    }
    .curtain-right {
      border-left: 1px solid rgba(0,0,0,0.08);
      transform-origin: right;
    }
    .curtain-overlay.open .curtain-left {
      transform: translateX(-100%);
    }
    .curtain-overlay.open .curtain-right {
      transform: translateX(100%);
    }
    .curtain-overlay.hidden {
      display: none !important;
    }
    ` : '';

    // 테마별 고유 CSS 변수 및 스타일 스키마
    let themeCss = '';
    if (data.theme === 'warm') {
      themeCss = `
        :root {
          --bg-wedding: #faf9f7;
          --bg-alt: #f3ece4;
          --color-text-main: #5a544f;
          --color-text-muted: #8e857c;
          --color-accent: #b89f8d;
          --font-family: 'Noto Serif KR', serif;
          --border-radius: 8px;
        }
        .main-invitation {
          box-shadow: 0 4px 30px rgba(184, 159, 141, 0.15);
        }
        .section-title {
          font-family: 'Noto Serif KR', serif;
          font-weight: 500;
          color: var(--color-text-main);
          border-bottom: 1px solid var(--bg-alt);
          padding-bottom: 15px;
          margin-bottom: 24px;
        }
      `;
    } else if (data.theme === 'minimal') {
      themeCss = `
        :root {
          --bg-wedding: #ffffff;
          --bg-alt: #f5f5f5;
          --color-text-main: #111111;
          --color-text-muted: #666666;
          --color-accent: #000000;
          --font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
          --border-radius: 2px;
        }
        .section-title {
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-size: 16px;
          color: var(--color-text-main);
          margin-bottom: 24px;
        }
        .main-invitation {
          border: 1px solid #eee;
        }
      `;
    } else if (data.theme === 'green') {
      themeCss = `
        :root {
          --bg-wedding: #f4f6f4;
          --bg-alt: #e3eae2;
          --color-text-main: #2b4c3f;
          --color-text-muted: #697d74;
          --color-accent: #8fa08b;
          --font-family: 'Noto Serif KR', serif;
          --border-radius: 16px;
        }
        .main-invitation {
          box-shadow: 0 10px 40px rgba(43, 76, 63, 0.08);
        }
        .section-title {
          font-family: 'Noto Serif KR', serif;
          font-weight: 500;
          color: var(--color-text-main);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 24px;
        }
        .section-title::before, .section-title::after {
          content: '✿';
          font-size: 11px;
          color: var(--color-accent);
        }
      `;
    }

    // 계좌 아코디언 HTML 데이터 생성
    const buildAccountsHtml = (accList) => {
      if (!accList || accList.length === 0) {
        return '<p class="no-accounts">등록된 계좌가 없습니다.</p>';
      }
      return accList.map(acc => `
        <div class="account-item">
          <div class="account-info">
            <span class="account-role">${acc.role}</span>
            <div class="account-details">
              <span class="bank-name">${acc.bank}</span>
              <span class="account-number">${acc.number}</span>
            </div>
          </div>
          <button class="btn-copy-account" data-clipboard="${acc.bank} ${acc.number}">복사</button>
        </div>
      `).join('');
    };

    const groomAccHtml = buildAccountsHtml(data.groom.accounts);
    const brideAccHtml = buildAccountsHtml(data.bride.accounts);

    // 부모 정보 포맷
    const parentSpan = (name, deceased) => deceased ? `<span class="parent-name deceased">${name}</span>` : `<span class="parent-name">${name}</span>`;

    // 갤러리 그리드 사진 HTML
    const galleryHtml = data.images.gallery && data.images.gallery.length > 0 
      ? data.images.gallery.map((src, idx) => `
        <div class="gallery-item" onclick="openPhotoViewer(${idx})">
          <img src="${src}" alt="갤러리 사진 ${idx + 1}" loading="lazy">
        </div>
      `).join('')
      : '<p class="no-photo-msg">업로드된 사진이 없습니다.</p>';

    // 갤러리 배열 문자열 주입 (전체화면 뷰어용)
    const galleryArrayStr = JSON.stringify(data.images.gallery || []);

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="format-detection" content="telephone=no">
  
  <!-- Meta / OG tags -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${data.metaTitle}">
  <meta property="og:description" content="${data.metaDesc}">
  <meta property="og:image" content="${data.images.hero}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${data.metaTitle}">
  <meta name="twitter:description" content="${data.metaDesc}">
  <meta name="twitter:image" content="${data.images.hero}">
  <meta name="description" content="${data.metaDesc}">
  
  <title>${data.metaTitle}</title>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;500;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
  
  <style>
    /* ─── 테마 고유 스타일 시트 ─── */
    ${themeCss}

    /* ─── 벚꽃 효과 및 커튼 시트 ─── */
    ${petalStyles}
    ${curtainStyles}

    /* ─── 기본 청첩장 CSS 정의 ─── */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: var(--font-family), -apple-system, sans-serif;
      background-color: #111113; /* 데스크톱에서 모바일 뷰 이외 영역 어둡게 */
      color: var(--color-text-main);
      line-height: 1.8;
      display: flex;
      justify-content: center;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    /* 모바일 가상 프레임 (가장자리 제한) */
    .main-invitation {
      width: 100%;
      max-width: 480px;
      background-color: var(--bg-wedding);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    
    .section {
      padding: 60px 24px;
      text-align: center;
    }
    
    /* ─── 1. 메인 히어로 섹션 ─── */
    .section-hero {
      padding: 0 0 40px 0;
      position: relative;
    }
    .hero-img-container {
      width: 100%;
      aspect-ratio: 3 / 4;
      overflow: hidden;
    }
    .hero-img-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .hero-text-area {
      padding: 30px 20px 10px 20px;
    }
    .wedding-dday-title {
      font-size: 13px;
      letter-spacing: 2px;
      color: var(--color-text-muted);
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .main-couple-names {
      font-size: 26px;
      font-weight: 400;
      letter-spacing: 4px;
      margin-bottom: 20px;
      color: var(--color-text-main);
    }
    .hero-venue-info {
      font-size: 13px;
      color: var(--color-text-muted);
      margin-bottom: 24px;
    }
    
    /* 카운트다운 타이머 */
    .timer-grid {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      margin-top: 10px;
    }
    .timer-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 45px;
    }
    .timer-num {
      font-size: 24px;
      font-weight: 300;
      line-height: 1.1;
      color: var(--color-text-main);
    }
    .timer-lbl {
      font-size: 10px;
      color: var(--color-text-muted);
      margin-top: 4px;
    }
    .timer-divider {
      font-size: 18px;
      color: var(--color-text-muted);
      opacity: 0.5;
      margin-bottom: 15px;
    }
    
    /* 캘린더 등록 버튼 */
    .cal-actions {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-top: 24px;
    }
    .btn-cal {
      padding: 8px 16px;
      border: 1px solid var(--color-accent);
      background: none;
      color: var(--color-text-main);
      font-family: inherit;
      font-size: 11px;
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
    }
    .btn-cal:hover {
      background-color: var(--bg-alt);
    }
    
    /* ─── 2. 스토리 섹션 ─── */
    .section-story {
      background-color: var(--bg-alt);
    }
    .story-img-wrap {
      width: 80%;
      margin: 0 auto 30px auto;
      border-radius: var(--border-radius);
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.06);
    }
    .story-img-wrap img {
      width: 100%;
      display: block;
    }
    .story-title {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 20px;
      color: var(--color-text-main);
    }
    .story-body {
      font-size: 14px;
      line-height: 2.2;
      color: var(--color-text-main);
      white-space: pre-line;
      margin-bottom: 30px;
    }
    
    .parents-relation-box {
      font-size: 14px;
      color: var(--color-text-muted);
      border-top: 1px solid rgba(0,0,0,0.05);
      padding-top: 30px;
      margin-top: 10px;
      line-height: 2.2;
    }
    .parent-line {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
    }
    .parent-name.deceased::before {
      content: "故 ";
      font-size: 11px;
      opacity: 0.6;
    }
    .child-relation-txt {
      font-weight: bold;
      color: var(--color-text-main);
    }
    
    /* ─── 3. 갤러리 섹션 ─── */
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-top: 20px;
    }
    .gallery-item {
      aspect-ratio: 1;
      overflow: hidden;
      border-radius: var(--border-radius);
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(0,0,0,0.03);
    }
    .gallery-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .gallery-item:hover img {
      transform: scale(1.05);
    }
    .no-photo-msg {
      font-size: 13px;
      color: var(--color-text-muted);
      grid-column: span 2;
      padding: 40px 0;
    }
    
    /* ─── 4. 오시는 길 섹션 ─── */
    .location-details {
      margin-bottom: 24px;
    }
    .loc-venue {
      font-size: 16px;
      font-weight: bold;
      color: var(--color-text-main);
      margin-bottom: 6px;
    }
    .loc-addr {
      font-size: 13px;
      color: var(--color-text-muted);
    }
    
    .loc-btn-wrap {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-bottom: 24px;
    }
    .btn-map-nav {
      padding: 10px 16px;
      border: 1px solid #ddd;
      background-color: #fff;
      color: #333;
      font-size: 12px;
      border-radius: 20px;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background-color 0.2s;
    }
    .btn-map-nav:hover {
      background-color: #f7f7f7;
    }
    
    .btn-map-copy {
      background-color: #fff;
      border-color: #ccc;
    }
    .btn-map-kakaomap {
      background-color: #fee500;
      border-color: #fee500;
      color: #3a1d1d;
    }
    .btn-map-kakaomap:hover { background-color: #fada0a; }
    
    .btn-map-navermap {
      background-color: #03c75a;
      border-color: #03c75a;
      color: #fff;
    }
    .btn-map-navermap:hover { background-color: #02b04f; }
    
    .map-img-box {
      width: 100%;
      border-radius: var(--border-radius);
      overflow: hidden;
      border: 1px solid rgba(0,0,0,0.06);
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    .map-img-box img {
      width: 100%;
      display: block;
    }
    
    /* ─── 5. 계좌(마음 전하실 곳) 섹션 ─── */
    .section-account {
      background-color: var(--bg-alt);
    }
    .account-intro-txt {
      font-size: 13px;
      color: var(--color-text-muted);
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .accordion-box {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
      margin: 0 auto;
    }
    .accordion-item {
      background-color: var(--bg-wedding);
      border-radius: var(--border-radius);
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.03);
    }
    .accordion-header {
      width: 100%;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: none;
      border: none;
      cursor: pointer;
      font-family: var(--font-family), sans-serif;
      font-size: 14px;
      font-weight: bold;
      color: var(--color-text-main);
    }
    .accordion-icon-spin {
      font-size: 16px;
      color: var(--color-text-muted);
      transition: transform 0.3s;
    }
    .accordion-item.active .accordion-icon-spin {
      transform: rotate(45deg);
    }
    .accordion-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease-out;
    }
    .accordion-item.active .accordion-content {
      max-height: 400px;
    }
    
    .account-item {
      padding: 14px 20px;
      border-top: 1px solid rgba(0,0,0,0.04);
      display: flex;
      justify-content: space-between;
      align-items: center;
      text-align: left;
    }
    .account-role {
      display: block;
      font-size: 11px;
      color: var(--color-text-muted);
      margin-bottom: 2px;
    }
    .account-details {
      font-size: 13px;
      color: var(--color-text-main);
    }
    .bank-name {
      font-weight: bold;
      margin-right: 6px;
    }
    .btn-copy-account {
      padding: 6px 12px;
      border: 1px solid var(--color-accent);
      background: none;
      font-size: 11px;
      color: var(--color-text-main);
      border-radius: var(--border-radius);
      cursor: pointer;
    }
    .btn-copy-account:hover {
      background-color: var(--bg-alt);
    }
    
    /* ─── 6. 푸터 ─── */
    .footer {
      padding: 40px 20px;
      text-align: center;
      border-top: 1px solid rgba(0,0,0,0.05);
      background-color: var(--bg-wedding);
    }
    .footer-txt {
      font-size: 11px;
      color: var(--color-text-muted);
      letter-spacing: 1px;
    }
    
    /* ─── 7. 라이트박스 포토 뷰어 모달 ─── */
    .photo-viewer {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0,0,0,0.95);
      z-index: 10000;
      display: none;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .photo-viewer.active {
      display: flex;
      opacity: 1;
    }
    .viewer-close-btn {
      position: absolute;
      top: 20px;
      right: 20px;
      background: none;
      border: none;
      color: #fff;
      font-size: 36px;
      cursor: pointer;
      z-index: 10005;
      line-height: 1;
    }
    .viewer-nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #fff;
      font-size: 40px;
      cursor: pointer;
      padding: 20px;
      z-index: 10005;
      user-select: none;
    }
    .viewer-prev-btn { left: 10px; }
    .viewer-next-btn { right: 10px; }
    .viewer-img-wrap {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      touch-action: pan-y;
    }
    .viewer-img-wrap img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      transition: transform 0.3s, opacity 0.2s;
    }
    .viewer-img-wrap img.fade-out {
      opacity: 0;
    }
    .viewer-counter-txt {
      position: absolute;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      color: #fff;
      font-size: 13px;
      letter-spacing: 1px;
    }
    
    /* ─── 8. 토스트 팝업 ─── */
    .toast-popup {
      position: fixed;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background-color: rgba(0,0,0,0.8);
      color: #fff;
      padding: 10px 20px;
      border-radius: 30px;
      font-size: 12px;
      z-index: 20000;
      opacity: 0;
      transition: all 0.3s ease;
      white-space: nowrap;
      pointer-events: none;
    }
    .toast-popup.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  </style>
</head>
<body>

  <!-- 커튼 오프닝 인트로 -->
  ${data.effectCurtain ? `
  <div class="curtain-overlay" id="curtainOverlay">
    <div class="curtain curtain-left"></div>
    <div class="curtain curtain-right"></div>
  </div>
  ` : ''}

  <!-- 모바일 메인 컨테이너 -->
  <main class="main-invitation">
    
    <!-- 1. 대표 메인 이미지 -->
    <section class="section section-hero">
      ${data.images.hero ? `
      <div class="hero-img-container">
        <img src="${data.images.hero}" alt="웨딩 대표 사진">
      </div>
      ` : ''}
      <div class="hero-text-area">
        <div class="wedding-dday-title">WEDDING DAY</div>
        <h1 class="main-couple-names"><span class="groom-name-txt">${data.groom.name}</span> & <span class="bride-name-txt">${data.bride.name}</span></h1>
        
        <div class="hero-venue-info">
          <p id="preview-date-time">${formatDateTimeString(data.wedding.date, data.wedding.time)}</p>
          <p id="preview-venue-name" style="margin-top: 6px; font-weight: 500;">${data.wedding.venue}</p>
        </div>
        
        <!-- 디데이 타이머 -->
        <div class="timer-grid">
          <div class="timer-block">
            <span class="timer-num" id="dday-d">0</span>
            <span class="timer-lbl">DAYS</span>
          </div>
          <div class="timer-divider">:</div>
          <div class="timer-block">
            <span class="timer-num" id="dday-h">0</span>
            <span class="timer-lbl">HOURS</span>
          </div>
          <div class="timer-divider">:</div>
          <div class="timer-block">
            <span class="timer-num" id="dday-m">0</span>
            <span class="timer-lbl">MINS</span>
          </div>
          <div class="timer-divider">:</div>
          <div class="timer-block">
            <span class="timer-num" id="dday-s">0</span>
            <span class="timer-lbl">SECS</span>
          </div>
        </div>
        
        <!-- 캘린더 등록 -->
        <div class="cal-actions">
          <a href="#" class="btn-cal" id="preview-gcal" target="_blank" rel="noopener">구글 캘린더 등록</a>
          <button class="btn-cal" id="preview-ical">애플 캘린더 저장</button>
        </div>
      </div>
    </section>
    
    <!-- 2. 초대 및 스토리 섹션 -->
    <section class="section section-story">
      <h2 class="section-title">초대합니다</h2>
      ${data.images.story ? `
      <div class="story-img-wrap">
        <img src="${data.images.story}" alt="스토리 대표 사진" loading="lazy">
      </div>
      ` : ''}
      <h3 class="story-title" id="preview-story-title">${data.story.title}</h3>
      <p class="story-body" id="preview-story-content">${data.story.content}</p>
      
      <!-- 혼주 정보 관계 박스 -->
      <div class="parents-relation-box">
        <div class="parent-line">
          ${parentSpan(data.groom.father, data.groom.fatherDeceased)} · ${parentSpan(data.groom.mother, data.groom.motherDeceased)}의 아들 
          <span class="child-relation-txt groom-name-txt">${data.groom.name}</span>
        </div>
        <div class="parent-line" style="margin-top: 8px;">
          ${parentSpan(data.bride.father, data.bride.fatherDeceased)} · ${parentSpan(data.bride.mother, data.bride.motherDeceased)}의 딸 
          <span class="child-relation-txt bride-name-txt">${data.bride.name}</span>
        </div>
      </div>
    </section>
    
    <!-- 3. 갤러리 섹션 -->
    <section class="section" id="preview-gallery-sec">
      <h2 class="section-title">갤러리</h2>
      <div class="gallery-grid">
        ${galleryHtml}
      </div>
    </section>
    
    <!-- 4. 오시는 길 섹션 -->
    <section class="section">
      <h2 class="section-title">오시는 길</h2>
      <div class="location-details">
        <div class="loc-venue" id="preview-venue-name-sec">${data.wedding.venue}</div>
        <div class="loc-addr" id="preview-address">${data.wedding.address}</div>
      </div>
      
      <div class="loc-btn-wrap">
        <button class="btn-map-nav btn-map-copy" id="btn-copy-address">주소 복사</button>
        <a href="${data.wedding.mapLinks.kakao}" class="btn-map-nav btn-map-kakaomap" id="preview-kakao-btn" target="_blank" rel="noopener">카카오맵</a>
        <a href="${data.wedding.mapLinks.naver}" class="btn-map-nav btn-map-navermap" id="preview-naver-btn" target="_blank" rel="noopener">네이버 지도</a>
      </div>
      
      ${data.images.location ? `
      <div class="map-img-box">
        <img src="${data.images.location}" alt="예식장 정적 약도" loading="lazy">
      </div>
      ` : ''}
    </section>
    
    <!-- 5. 축의금 송금 섹션 -->
    <section class="section section-account">
      <h2 class="section-title">마음 전하실 곳</h2>
      <p class="account-intro-txt">참석이 어려우신 분들을 위해 비대면으로나마<br>마음을 전하실 수 있도록 안내해 드립니다.</p>
      
      <div class="accordion-box">
        <div class="accordion-item">
          <button class="accordion-header" onclick="toggleAccordion(this)">
            <span>신랑측 계좌번호</span>
            <span class="accordion-icon-spin">+</span>
          </button>
          <div class="accordion-content">
            ${groomAccHtml}
          </div>
        </div>
        
        <div class="accordion-item">
          <button class="accordion-header" onclick="toggleAccordion(this)">
            <span>신부측 계좌번호</span>
            <span class="accordion-icon-spin">+</span>
          </button>
          <div class="accordion-content">
            ${brideAccHtml}
          </div>
        </div>
      </div>
    </section>
    
    <!-- 푸터 -->
    <footer class="footer">
      <p class="footer-txt"><span class="groom-name-txt">${data.groom.name}</span> & <span class="bride-name-txt">${data.bride.name}</span> Wedding</p>
    </footer>
  </main>

  <!-- 라이트박스 사진 확대 모달 -->
  <div class="photo-viewer" id="photoViewer" role="dialog" aria-modal="true">
    <button class="viewer-close-btn" onclick="closePhotoViewer()">&times;</button>
    <button class="viewer-nav-btn viewer-prev-btn" onclick="navigatePhotoViewer('prev')">&#10094;</button>
    <button class="viewer-nav-btn viewer-next-btn" onclick="navigatePhotoViewer('next')">&#10095;</button>
    <div class="viewer-img-wrap" id="viewerImgWrap">
      <img src="" alt="확대 이미지" id="viewerImg">
    </div>
    <div class="viewer-counter-txt">
      <span id="viewer-curr-idx">1</span> / <span id="viewer-total-count">0</span>
    </div>
  </div>

  <!-- 토스트 알림창 -->
  <div id="toastPopup" class="toast-popup"></div>

  <!-- ─── 인터랙티브 기능 스크립트 ─── -->
  <script>
    // 갤러리 이미지 데이터 주입
    const galleryImages = ${galleryArrayStr};
    let currentPhotoIndex = 0;
    
    // 1. 커튼 효과 실행
    function openCurtain() {
      const curtain = document.getElementById('curtainOverlay');
      if (curtain) {
        setTimeout(() => {
          curtain.classList.add('open');
          setTimeout(() => {
            curtain.classList.add('hidden');
          }, 1200);
        }, 800);
      }
    }
    
    // 2. D-day 타이머 구현
    let countdownInterval = null;
    function startCountdown() {
      const targetDate = new Date("${data.wedding.date}T${data.wedding.time}:00+09:00");
      
      function update() {
        const now = new Date();
        const diff = targetDate - now;
        
        if (diff <= 0) {
          document.getElementById('dday-d').textContent = '0';
          document.getElementById('dday-h').textContent = '0';
          document.getElementById('dday-m').textContent = '0';
          document.getElementById('dday-s').textContent = '0';
          clearInterval(countdownInterval);
          return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        document.getElementById('dday-d').textContent = days;
        document.getElementById('dday-h').textContent = hours;
        document.getElementById('dday-m').textContent = minutes;
        document.getElementById('dday-s').textContent = seconds;
      }
      
      update();
      if (countdownInterval) clearInterval(countdownInterval);
      countdownInterval = setInterval(update, 1000);
    }
    
    // 3. 구글/애플 캘린더 생성기
    function initCalendars() {
      const dt = new Date("${data.wedding.date}T${data.wedding.time}:00+09:00");
      if (isNaN(dt.getTime())) return;
      const startDate = dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const endDt = new Date(dt.getTime() + 2 * 60 * 60 * 1000);
      const endDate = endDt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      
      const title = "${data.groom.name} & ${data.bride.name} 결혼식";
      const venue = "${data.wedding.venue}";
      const address = "${data.wedding.address}";
      
      // 구글 링크
      const gcalUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + 
        encodeURIComponent(title) + "&dates=" + startDate + "/" + endDate + 
        "&location=" + encodeURIComponent(venue + " " + address) + 
        "&details=" + encodeURIComponent("결혼식에 초대합니다.");
      
      const gcalBtn = document.getElementById('preview-gcal');
      if (gcalBtn) gcalBtn.href = gcalUrl;
      
      // 캘린더 ics 다운로드
      const icalBtn = document.getElementById('preview-ical');
      if (icalBtn) {
        icalBtn.onclick = function() {
          const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Wedding//Invitation//KO',
            'BEGIN:VEVENT',
            'DTSTART:' + startDate,
            'DTEND:' + endDate,
            'SUMMARY:' + title,
            'LOCATION:' + venue + ' ' + address,
            'DESCRIPTION:결혼식에 초대합니다.',
            'END:VEVENT',
            'END:VCALENDAR'
          ].join('\\r\\n');
          
          const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'wedding.ics';
          a.click();
          URL.revokeObjectURL(url);
          showToast('일정 파일이 다운로드됩니다.');
        };
      }
    }
    
    // 4. 주소 복사
    const copyAddrBtn = document.getElementById('btn-copy-address');
    if (copyAddrBtn) {
      copyAddrBtn.onclick = function() {
        const address = "${data.wedding.address}";
        copyText(address, '주소가 복사되었습니다.');
      };
    }
    
    // 클립보드 복사 헬퍼
    function copyText(text, successMsg) {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
          showToast(successMsg);
        }).catch(() => {
          fallbackCopy(text, successMsg);
        });
      } else {
        fallbackCopy(text, successMsg);
      }
    }
    
    function fallbackCopy(text, successMsg) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand('copy');
        showToast(successMsg);
      } catch (err) {
        showToast('복사에 실패했습니다.');
      }
      ta.remove();
    }
    
    // 5. 토스트 팝업 실행
    let toastTimer = null;
    function showToast(msg) {
      const toast = document.getElementById('toastPopup');
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, 2200);
    }
    
    // 6. 아코디언 토글
    function toggleAccordion(btn) {
      const item = btn.parentElement;
      item.classList.toggle('active');
    }
    
    // 계좌 복사 위임
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('.btn-copy-account');
      if (btn) {
        const text = btn.dataset.clipboard;
        copyText(text, '계좌번호가 복사되었습니다.');
      }
    });
    
    // 7. 라이트박스 뷰어 기능
    function openPhotoViewer(idx) {
      if (!galleryImages || galleryImages.length === 0) return;
      currentPhotoIndex = idx;
      
      const viewer = document.getElementById('photoViewer');
      const img = document.getElementById('viewerImg');
      
      img.src = galleryImages[idx];
      document.getElementById('viewer-curr-idx').textContent = idx + 1;
      document.getElementById('viewer-total-count').textContent = galleryImages.length;
      
      viewer.classList.add('active');
      document.body.style.overflow = 'hidden'; // 바디 스크롤 차단
    }
    
    function closePhotoViewer() {
      document.getElementById('photoViewer').classList.remove('active');
      document.body.style.overflow = '';
    }
    
    function navigatePhotoViewer(dir) {
      const img = document.getElementById('viewerImg');
      img.classList.add('fade-out');
      
      setTimeout(() => {
        if (dir === 'prev') {
          currentPhotoIndex = (currentPhotoIndex - 1 + galleryImages.length) % galleryImages.length;
        } else {
          currentPhotoIndex = (currentPhotoIndex + 1) % galleryImages.length;
        }
        img.src = galleryImages[currentPhotoIndex];
        document.getElementById('viewer-curr-idx').textContent = currentPhotoIndex + 1;
        img.classList.remove('fade-out');
      }, 150);
    }
    
    // 8. 벚꽃 잎 날리기 애니메이션
    function initPetals() {
      const usePetals = ${data.effectPetals ? 'true' : 'false'};
      if (!usePetals) return;
      
      const container = document.createElement('div');
      container.className = 'petals-container';
      document.body.appendChild(container);
      
      const maxPetals = 35;
      let count = 0;
      
      function createPetal() {
        const petal = document.createElement('div');
        petal.className = 'petal';
        
        const startX = Math.random() * 100;
        const size = Math.random() * 8 + 8;
        const duration = Math.random() * 4 + 5;
        const delay = Math.random() * 2;
        
        petal.style.left = startX + 'vw';
        petal.style.width = size + 'px';
        petal.style.height = size + 'px';
        petal.style.animationDuration = duration + 's';
        petal.style.animationDelay = delay + 's';
        
        container.appendChild(petal);
        
        setTimeout(() => {
          petal.remove();
        }, (duration + delay) * 1000 + 100);
      }
      
      const interval = setInterval(() => {
        if (count >= maxPetals) {
          clearInterval(interval);
          return;
        }
        createPetal();
        if (Math.random() > 0.5) createPetal();
        count++;
      }, 450);
    }
    
    // 키보드 & 스와이프 기능 연동
    document.addEventListener('keydown', function(e) {
      const viewer = document.getElementById('photoViewer');
      if (viewer && viewer.classList.contains('active')) {
        if (e.key === 'Escape') closePhotoViewer();
        if (e.key === 'ArrowLeft') navigatePhotoViewer('prev');
        if (e.key === 'ArrowRight') navigatePhotoViewer('next');
      }
    });
    
    // 스와이프 제스처
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeArea = document.getElementById('viewerImgWrap');
    if (swipeArea) {
      swipeArea.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
      }, { passive: true });
      swipeArea.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].clientX;
        const diffX = touchStartX - touchEndX;
        if (Math.abs(diffX) > 50) {
          if (diffX > 0) navigatePhotoViewer('next');
          else navigatePhotoViewer('prev');
        }
      }, { passive: true });
    }
    
    // 빌더 이벤트 수신
    window.addEventListener('message', function(e) {
      if (e.data.action === 'reset-curtain') {
        const overlay = document.getElementById('curtainOverlay');
        if (overlay) {
          overlay.className = 'curtain-overlay';
          setTimeout(() => {
            openCurtain();
          }, 100);
        }
      } else if (e.data.action === 'update-state') {
        // 날짜 & 시간 동적 변경 시 카운트다운 및 캘린더 리빌딩
        startCountdown();
        initCalendars();
      }
    });

    // 초기화 작동
    window.onload = function() {
      openCurtain();
      startCountdown();
      initCalendars();
      initPetals();
    };
  </script>
</body>
</html>`;
  }

  // ─── 내보내기 & 다운로드 로직 ───
  function initExportEngine() {
    const btn = $('#btn-copy-share-link');
    if (btn) {
      btn.addEventListener('click', () => {
        // 복제한 상태 객체 생성 (기저64 이미지는 용량 초과 방지를 위해 필터링)
        const exportState = JSON.parse(JSON.stringify(state));
        
        let hasBase64 = false;
        
        // 단일 이미지 검사
        ['hero', 'story', 'location'].forEach(key => {
          if (exportState.images[key] && exportState.images[key].startsWith('data:image')) {
            exportState.images[key] = ''; // Base64 삭제
            hasBase64 = true;
          }
        });
        
        // 갤러리 이미지 검사
        if (exportState.images.gallery && exportState.images.gallery.length > 0) {
          exportState.images.gallery = exportState.images.gallery.filter(img => {
            if (img.startsWith('data:image')) {
              hasBase64 = true;
              return false; // 기저64 제외
            }
            return true;
          });
        }
        
        // JSON 문자열화 및 Base64 인코딩
        const jsonStr = JSON.stringify(exportState);
        const encodedData = btoa(encodeURIComponent(jsonStr));
        
        // 공유 URL 생성
        const shareUrl = window.location.origin + window.location.pathname + '#invite=' + encodedData;
        
        // 클립보드 복사
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(shareUrl).then(() => {
            showShareToast(hasBase64);
          }).catch(() => {
            fallbackCopy(shareUrl, hasBase64);
          });
        } else {
          fallbackCopy(shareUrl, hasBase64);
        }
      });
    }
    
    function showShareToast(hasBase64) {
      if (hasBase64) {
        showToast('⚠️ 파일로 업로드된 사진은 용량 제한으로 링크에서 제외되었습니다. 사진을 포함하려면 이미지 주소(URL)를 입력하세요.');
      } else {
        showToast('🎉 청첩장 공유 링크가 클립보드에 복사되었습니다! 이 주소를 동생과 하객들에게 보내주세요.');
      }
    }
    
    function fallbackCopy(text, hasBase64) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand('copy');
        showShareToast(hasBase64);
      } catch (err) {
        showToast('링크 복사에 실패했습니다.');
      }
      ta.remove();
    }
  }

  // ─── 갤러리 썸네일 초기 설정 ───
  function initDefaults() {
    renderGalleryThumbs();
    
    // 기본 이미지가 등록된 업로드 박스 썸네일 그리기
    const heroDropzone = $('#dropzone-hero');
    heroDropzone.querySelector('.upload-prompt').classList.add('hidden');
    const heroThumb = heroDropzone.querySelector('.thumbnail-preview');
    heroThumb.classList.remove('hidden');
    heroThumb.querySelector('img').src = state.images.hero;

    const storyDropzone = $('#dropzone-story');
    storyDropzone.querySelector('.upload-prompt').classList.add('hidden');
    const storyThumb = storyDropzone.querySelector('.thumbnail-preview');
    storyThumb.classList.remove('hidden');
    storyThumb.querySelector('img').src = state.images.story;

    const locationDropzone = $('#dropzone-location');
    locationDropzone.querySelector('.upload-prompt').classList.add('hidden');
    const locationThumb = locationDropzone.querySelector('.thumbnail-preview');
    locationThumb.classList.remove('hidden');
    locationThumb.querySelector('img').src = state.images.location;
  }

  // ─── 앱 초기화 엔트리 ───
  function init() {
    // 1. 하객 뷰 체크 (#invite= 해시 존재 여부)
    const hash = window.location.hash;
    if (hash && hash.startsWith('#invite=')) {
      document.body.classList.add('guest-view');
      try {
        const encodedData = hash.substring(8);
        const decodedJson = decodeURIComponent(atob(encodedData));
        const importedState = JSON.parse(decodedJson);
        
        // 상태 덮어쓰기
        Object.assign(state, importedState);
      } catch (e) {
        console.error('청첩장 데이터 디코딩 실패', e);
        showToast('⚠️ 청첩장 데이터를 불러오는데 실패했습니다.');
      }
      
      initDeviceControls();
      updatePreview(true);
      return; // 더 이상 에디터 로직을 실행하지 않음
    }

    // 2. 에디터 뷰 초기화
    initTabs();
    initDeviceControls();
    bindFormInputs();
    bindImageUrlInputs();
    initAccountsManager();
    initImageUploads();
    initExportEngine();
    initDefaults();
    
    // 프리뷰 최초 렌더링
    updatePreview(true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
