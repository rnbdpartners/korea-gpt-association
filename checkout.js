// 결제 페이지 기능 구현

document.addEventListener('DOMContentLoaded', function() {
    // 단계별 요소들
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.checkout-step-content');
    const cartStep = document.getElementById('cart-step');
    const orderStep = document.getElementById('order-step');
    const completeStep = document.getElementById('complete-step');
    
    // 현재 단계
    let currentStep = 0;
    
    // localStorage에서 장바구니 데이터 로드
    loadCartItems();
    
    // 단계 이동 함수
    function goToStep(stepIndex) {
        // 모든 단계 비활성화
        steps.forEach(step => step.classList.remove('active'));
        stepContents.forEach(content => content.classList.remove('active'));
        
        // 현재 단계와 이전 단계들 활성화
        for (let i = 0; i <= stepIndex; i++) {
            steps[i].classList.add('active');
        }
        
        // 해당 단계 콘텐츠 표시
        stepContents[stepIndex].classList.add('active');
        currentStep = stepIndex;
        
        // 페이지 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // 장바구니 아이템 삭제
    const removeButtons = document.querySelectorAll('.btn-remove');
    removeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('이 강의를 장바구니에서 삭제하시겠습니까?')) {
                const cartItem = this.closest('.cart-item');
                cartItem.style.opacity = '0';
                setTimeout(() => {
                    cartItem.remove();
                    updateTotalPrice();
                }, 300);
            }
        });
    });
    
    // 가격 업데이트 함수
    function updateTotalPrice() {
        const cartItems = document.querySelectorAll('.cart-item');
        let total = 0;
        let originalTotal = 0;
        
        cartItems.forEach(item => {
            const priceText = item.querySelector('.final-price').textContent;
            const price = parseInt(priceText.replace(/[^0-9]/g, ''));
            const originalPriceText = item.querySelector('.original-price').textContent;
            const originalPrice = parseInt(originalPriceText.replace(/[^0-9]/g, ''));
            
            total += price;
            originalTotal += originalPrice;
        });
        
        // 요약 정보 업데이트
        const summaryItems = document.querySelectorAll('.summary-item span');
        if (summaryItems.length >= 4) {
            summaryItems[1].textContent = originalTotal.toLocaleString() + '원';
            summaryItems[3].textContent = '-' + (originalTotal - total).toLocaleString() + '원';
        }
        
        const totalPriceElement = document.querySelector('.total-price');
        if (totalPriceElement) {
            totalPriceElement.textContent = total.toLocaleString() + '원';
        }
        
        // 결제 버튼 금액 업데이트
        const paymentBtn = document.querySelector('.btn-payment');
        if (paymentBtn) {
            paymentBtn.textContent = total.toLocaleString() + '원 결제하기';
        }
    }
    
    // 쿠폰 적용
    const applyCouponBtn = document.querySelector('.btn-apply-coupon');
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', function() {
            const couponInput = this.previousElementSibling;
            const couponCode = couponInput.value.trim().toUpperCase();
            
            if (!couponCode) {
                alert('쿠폰 코드를 입력해주세요.');
                return;
            }
            
            // 샘플 쿠폰 코드 검증
            const validCoupons = {
                'WELCOME10': 10,
                'STUDENT20': 20,
                'SPECIAL30': 30
            };
            
            if (validCoupons[couponCode]) {
                const discount = validCoupons[couponCode];
                alert(`${discount}% 할인 쿠폰이 적용되었습니다!`);
                
                // 쿠폰 할인 표시
                const couponDiscountRow = document.querySelector('.coupon-discount');
                if (couponDiscountRow) {
                    couponDiscountRow.style.display = 'flex';
                    // 여기서 실제 할인 계산 로직 구현
                }
                
                couponInput.value = '';
                couponInput.disabled = true;
                this.textContent = '적용됨';
                this.disabled = true;
            } else {
                alert('유효하지 않은 쿠폰 코드입니다.');
            }
        });
    }
    
    // 다음 단계 버튼
    const nextStepBtn = document.querySelector('.btn-next-step');
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', function() {
            goToStep(1); // 주문정보 단계로
        });
    }
    
    // 이전 단계 버튼
    const prevStepBtn = document.querySelector('.btn-prev-step');
    if (prevStepBtn) {
        prevStepBtn.addEventListener('click', function() {
            goToStep(0); // 장바구니 단계로
        });
    }
    
    // 계속 쇼핑하기 버튼
    const continueShoppingBtn = document.querySelector('.btn-continue-shopping');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function() {
            window.location.href = 'online-class.html';
        });
    }
    
    // 전체 동의 체크박스
    const agreeAllCheckbox = document.getElementById('agree-all');
    const agreeItems = document.querySelectorAll('.agree-item');
    
    if (agreeAllCheckbox) {
        agreeAllCheckbox.addEventListener('change', function() {
            agreeItems.forEach(item => {
                item.checked = this.checked;
            });
        });
    }
    
    // 개별 동의 체크박스
    agreeItems.forEach(item => {
        item.addEventListener('change', function() {
            const allChecked = Array.from(agreeItems).every(checkbox => checkbox.checked);
            if (agreeAllCheckbox) {
                agreeAllCheckbox.checked = allChecked;
            }
        });
    });
    
    // 결제하기 버튼
    const paymentBtn = document.querySelector('.btn-payment');
    if (paymentBtn) {
        paymentBtn.addEventListener('click', function() {
            // 폼 검증
            const buyerName = document.getElementById('buyer-name');
            const buyerEmail = document.getElementById('buyer-email');
            const buyerPhone = document.getElementById('buyer-phone');
            const requiredAgreements = document.querySelectorAll('.agree-item[required]');
            
            // 필수 입력 검증
            if (!buyerName.value.trim()) {
                alert('이름을 입력해주세요.');
                buyerName.focus();
                return;
            }
            
            if (!buyerEmail.value.trim()) {
                alert('이메일을 입력해주세요.');
                buyerEmail.focus();
                return;
            }
            
            if (!buyerPhone.value.trim()) {
                alert('휴대폰 번호를 입력해주세요.');
                buyerPhone.focus();
                return;
            }
            
            // 필수 약관 동의 검증
            const allAgreed = Array.from(requiredAgreements).every(checkbox => checkbox.checked);
            if (!allAgreed) {
                alert('필수 약관에 모두 동의해주세요.');
                return;
            }
            
            // 결제 수단 확인
            const selectedPayment = document.querySelector('input[name="payment"]:checked');
            const paymentMethod = selectedPayment ? selectedPayment.value : '';
            
            // 여기서 실제 결제 프로세스 진행
            // 지금은 시뮬레이션으로 바로 완료 단계로 이동
            
            // 로딩 표시
            this.textContent = '결제 처리중...';
            this.disabled = true;
            
            // 2초 후 결제 완료 단계로 이동
            setTimeout(() => {
                goToStep(2); // 결제완료 단계로
                
                // 주문번호 생성 (현재 시간 기반)
                const orderNumber = document.querySelector('.order-number strong');
                if (orderNumber) {
                    const now = new Date();
                    const orderNum = now.getFullYear() + 
                                   String(now.getMonth() + 1).padStart(2, '0') +
                                   String(now.getDate()).padStart(2, '0') +
                                   String(now.getHours()).padStart(2, '0') +
                                   String(now.getMinutes()).padStart(2, '0') +
                                   String(now.getSeconds()).padStart(2, '0');
                    orderNumber.textContent = orderNum;
                }
                
                // 이메일 표시 업데이트
                const emailNotice = document.querySelector('.email-notice strong');
                if (emailNotice && buyerEmail) {
                    emailNotice.textContent = buyerEmail.value;
                }
            }, 2000);
        });
    }
    
    // 학습 시작하기 버튼들
    const startLearningBtns = document.querySelectorAll('.btn-start-learning');
    startLearningBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            window.location.href = 'course-player.html';
        });
    });
    
    // 내 강의실 가기 버튼
    const goClassroomBtn = document.querySelector('.btn-go-classroom');
    if (goClassroomBtn) {
        goClassroomBtn.addEventListener('click', function() {
            window.location.href = 'my-classroom.html';
        });
    }
    
    // 더 둘러보기 버튼
    const continueBrowseBtn = document.querySelector('.btn-continue-browse');
    if (continueBrowseBtn) {
        continueBrowseBtn.addEventListener('click', function() {
            window.location.href = 'online-class.html';
        });
    }
    
    // 결제 수단 선택 시 시각적 피드백
    const paymentMethods = document.querySelectorAll('input[name="payment"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            // 선택된 결제 수단에 따른 추가 처리
            console.log('선택된 결제 수단:', this.value);
        });
    });
    
    // 현금영수증 선택 시 추가 입력 필드 표시 (필요한 경우)
    const receiptOptions = document.querySelectorAll('input[name="receipt"]');
    receiptOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.value !== 'none') {
                // 현금영수증 번호 입력 필드 표시 로직
                console.log('현금영수증 발급:', this.value);
            }
        });
    });
    
    // 초기 가격 계산
    updateTotalPrice();
});

// 장바구니 아이템 로드 함수
function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItemsContainer = document.querySelector('.cart-items');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>장바구니가 비어있습니다.</p>
                <a href="online-class.html" class="btn-continue-shopping">강의 둘러보기</a>
            </div>
        `;
        return;
    }
    
    // 기존 샘플 아이템 제거
    cartItemsContainer.innerHTML = '';
    
    // 장바구니 아이템 생성
    cart.forEach(item => {
        const cartItemHTML = `
            <div class="cart-item" data-id="${item.id}">
                <div class="item-image">
                    <img src="${item.thumbnail}" alt="${item.title}">
                </div>
                <div class="item-info">
                    <h3>${item.title}</h3>
                    <p class="instructor">${item.instructor}</p>
                    <div class="item-meta">
                        <span><i class="fas fa-clock"></i> ${item.duration}</span>
                        <span><i class="fas fa-video"></i> ${item.lectures}</span>
                        <span><i class="fas fa-infinity"></i> 평생 소장</span>
                    </div>
                </div>
                <div class="item-price">
                    <span class="original-price">${item.originalPrice}</span>
                    <span class="discount-rate">${item.discountRate}</span>
                    <div class="final-price">${item.finalPrice}</div>
                </div>
                <button class="btn-remove" title="삭제" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHTML);
    });
    
    // 주문 내역에도 반영
    updateOrderSummary(cart);
}

// 장바구니에서 제거
function removeFromCart(itemId) {
    if (confirm('이 강의를 장바구니에서 삭제하시겠습니까?')) {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart = cart.filter(item => item.id !== itemId);
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // UI 업데이트
        const cartItem = document.querySelector(`.cart-item[data-id="${itemId}"]`);
        if (cartItem) {
            cartItem.style.opacity = '0';
            setTimeout(() => {
                cartItem.remove();
                updateTotalPrice();
                
                // 장바구니가 비었는지 확인
                if (cart.length === 0) {
                    loadCartItems();
                }
            }, 300);
        }
    }
}

// 주문 내역 업데이트
function updateOrderSummary(cart) {
    const orderItems = document.querySelector('.order-items');
    if (orderItems) {
        orderItems.innerHTML = '';
        cart.forEach(item => {
            const orderItemHTML = `
                <div class="order-item">
                    <span>${item.title}</span>
                    <span>${item.finalPrice}</span>
                </div>
            `;
            orderItems.insertAdjacentHTML('beforeend', orderItemHTML);
        });
    }
}