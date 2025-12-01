document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const cashRequestForm = document.getElementById('cashRequestForm');
    const checkAvailabilityBtn = document.getElementById('checkAvailability');
    const paymentSection = document.getElementById('paymentSection');
    const requestedAmountSpan = document.getElementById('requestedAmount');
    const commissionAmountSpan = document.getElementById('commissionAmount');
    const totalAmountSpan = document.getElementById('totalAmount');
    const paymentMethods = document.querySelectorAll('.payment-method');
    const qrCodes = document.querySelectorAll('.qr-code');
    const bankDetails = document.getElementById('bankDetails');
    const confirmPaymentBtn = document.getElementById('confirmPayment');
    const paymentPending = document.getElementById('paymentPending');
    const paymentSuccess = document.getElementById('paymentSuccess');
    const pickupInfo = document.getElementById('pickupInfo');
    const pickupLocation = document.getElementById('pickupLocation');
    const pickupAddress = document.getElementById('pickupAddress');
    const pickupTime = document.getElementById('pickupTime');
    const studentTypeSelect = document.getElementById('studentType');
    const phoneNumberGroup = document.getElementById('phoneNumberGroup');
    const countryCodeSelect = document.getElementById('countryCode');
    const phoneInput = document.getElementById('phone');
    const paymentProofUpload = document.getElementById('paymentProofUpload');
    const paymentProofInput = document.getElementById('paymentProof');
    const fileNameDisplay = document.getElementById('fileName');

    // Variables
    let selectedPaymentMethod = '';
    let requestedAmount = 0;
    let paymentProofFile = null;

    // Country codes data with flag image URLs - FIXED PATHS
    const countryCodes = {
        'india': { 
            code: '+91', 
            flag: 'https://flagcdn.com/w40/in.png',
            name: 'India'
        },
        'nepal': { 
            code: '+977', 
            flag: 'https://flagcdn.com/w40/np.png',
            name: 'Nepal'
        },
        'srilanka': { 
            code: '+94', 
            flag: 'https://flagcdn.com/w40/lk.png',
            name: 'Sri Lanka'
        },
        'other': { 
            code: '', 
            flag: '',
            name: 'Other'
        }
    };

    // Initialize country codes dropdown with flag images
    function initializeCountryCodes() {
        countryCodeSelect.innerHTML = '<option value="">Select country</option>';
        
        for (const [country, data] of Object.entries(countryCodes)) {
            const option = document.createElement('option');
            option.value = data.code;
            
            if (data.flag) {
                const flagImg = document.createElement('img');
                flagImg.src = data.flag;
                flagImg.alt = data.name;
                flagImg.className = 'flag-icon';
                flagImg.style.width = '20px';
                flagImg.style.height = '15px';
                flagImg.style.marginRight = '8px';
                
                const optionText = document.createTextNode(` ${data.name} (${data.code})`);
                
                // Create a container for flag and text
                const optionContent = document.createElement('span');
                optionContent.appendChild(flagImg);
                optionContent.appendChild(optionText);
                
                option.appendChild(optionContent);
            } else {
                option.textContent = `${data.name} (${data.code})`;
            }
            
            option.dataset.country = country;
            countryCodeSelect.appendChild(option);
        }
    }

    // Student type change handler - FIXED
    studentTypeSelect.addEventListener('change', function() {
        console.log('Student type changed to:', this.value);
        
        if (this.value === 'national' || this.value === 'international') {
            phoneNumberGroup.style.display = 'block';
            
            if (this.value === 'national') {
                // Auto-select India for national students
                countryCodeSelect.value = '+91';
                phoneInput.placeholder = '10-digit phone number';
                phoneInput.pattern = '[0-9]{10}';
                phoneInput.title = 'Please enter a 10-digit phone number';
            } else {
                // For international, don't auto-select
                countryCodeSelect.value = '';
                phoneInput.placeholder = 'Enter phone number';
                phoneInput.pattern = null;
                phoneInput.title = '';
            }
        } else {
            phoneNumberGroup.style.display = 'none';
        }
    });

    // Country code change handler
    countryCodeSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const country = selectedOption.dataset.country;
        
        if (country === 'india') {
            phoneInput.pattern = '[0-9]{10}';
            phoneInput.title = 'Please enter a 10-digit phone number';
            phoneInput.placeholder = '10-digit phone number';
        } else if (country === 'nepal' || country === 'srilanka') {
            phoneInput.pattern = '[0-9]{9,10}';
            phoneInput.title = 'Please enter a valid phone number';
            phoneInput.placeholder = 'Phone number';
        } else if (country === 'other') {
            phoneInput.pattern = null;
            phoneInput.title = '';
            phoneInput.placeholder = 'Enter phone number with country code';
        }
    });

    // File upload handler
    paymentProofUpload.addEventListener('click', function() {
        paymentProofInput.click();
    });

    paymentProofInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            paymentProofFile = this.files[0];
            fileNameDisplay.textContent = paymentProofFile.name;
            paymentProofUpload.style.borderColor = 'var(--success)';
            
            // Save payment proof info for admin
            const studentRequest = JSON.parse(localStorage.getItem('studentRequest') || '{}');
            if (studentRequest.name) {
                studentRequest.paymentProof = {
                    fileName: paymentProofFile.name,
                    fileSize: paymentProofFile.size,
                    uploadTime: new Date().toISOString()
                };
                localStorage.setItem('studentRequest', JSON.stringify(studentRequest));
            }
        } else {
            paymentProofFile = null;
            fileNameDisplay.textContent = 'No file selected';
            paymentProofUpload.style.borderColor = '#ddd';
        }
    });

    // Check availability button click - FIXED
    checkAvailabilityBtn.addEventListener('click', function() {
        console.log('Check Availability button clicked');
        
        const amount = parseInt(document.getElementById('amount').value);
        const name = document.getElementById('name').value;
        const studentId = document.getElementById('studentId').value;
        const studentType = document.getElementById('studentType').value;
        const countryCode = document.getElementById('countryCode').value;
        const phone = document.getElementById('phone').value;
        
        // Debug log
        console.log('Form values:', { amount, name, studentId, studentType, countryCode, phone });
        
        // Validation
        if (!amount || amount < 100 || amount > 5000) {
            alert('Please enter a valid amount between ₹100 and ₹5000');
            return;
        }
        
        if (!name || !/^[A-Za-z\s]+$/.test(name)) {
            alert('Please enter a valid name (letters and spaces only)');
            return;
        }
        
        if (!studentId || !/^BL\.[A-Za-z0-9]{2}\.[A-Za-z0-9]{10}$/.test(studentId)) {
            alert('Please enter a valid Student ID in format BL.XX.XXXXXXXXXX');
            return;
        }
        
        if (!studentType) {
            alert('Please select student type');
            return;
        }
        
        // Check if phone number group should be visible
        if ((studentType === 'national' || studentType === 'international') && phoneNumberGroup.style.display === 'none') {
            alert('Please fill in phone number details');
            return;
        }
        
        if (!countryCode) {
            alert('Please select country code');
            return;
        }
        
        if (!phone) {
            alert('Please enter phone number');
            return;
        }
        
        // Validate phone number based on country
        const selectedOption = countryCodeSelect.options[countryCodeSelect.selectedIndex];
        const country = selectedOption.dataset.country;
        
        if (country === 'india' && !/^[0-9]{10}$/.test(phone)) {
            alert('Please enter a valid 10-digit Indian phone number');
            return;
        }
        
        if ((country === 'nepal' || country === 'srilanka') && !/^[0-9]{9,10}$/.test(phone)) {
            alert('Please enter a valid phone number');
            return;
        }
        
        // Save student request for admin - USING UNIQUE KEY
        const studentRequest = {
            name,
            studentId,
            amount,
            studentType,
            countryCode,
            phone,
            timestamp: new Date().toISOString(),
            status: 'pending',
            requestId: 'req_' + Date.now() // Unique ID
        };
        
        // Save to localStorage with unique key
        localStorage.setItem('currentStudentRequest', JSON.stringify(studentRequest));
        console.log('Request saved:', studentRequest);
        
        // Show payment section
        requestedAmount = amount;
        const commission = Math.round(amount * 0.05);
        const total = amount + commission;
        
        requestedAmountSpan.textContent = `₹${amount}`;
        commissionAmountSpan.textContent = `₹${commission}`;
        totalAmountSpan.textContent = `₹${total}`;
        
        // Show payment section
        paymentSection.style.display = 'block';
        
        // Scroll to payment section
        paymentSection.scrollIntoView({ behavior: 'smooth' });
        
        alert('Your request has been submitted. You can now proceed with payment.');
    });

    // Payment method selection
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            // Remove selected class from all methods
            paymentMethods.forEach(m => m.classList.remove('selected'));
            
            // Add selected class to clicked method
            this.classList.add('selected');
            
            // Hide all QR codes and bank details
            qrCodes.forEach(qr => qr.style.display = 'none');
            bankDetails.style.display = 'none';
            
            // Show selected payment method's details
            selectedPaymentMethod = this.getAttribute('data-method');
            
            if (selectedPaymentMethod === 'bank') {
                bankDetails.style.display = 'block';
            } else {
                document.getElementById(`${selectedPaymentMethod}Qr`).style.display = 'block';
            }
        });
    });

    // Confirm payment button click - UPDATED
    confirmPaymentBtn.addEventListener('click', function() {
        if (!selectedPaymentMethod) {
            alert('Please select a payment method');
            return;
        }
        
        if (!paymentProofFile) {
            alert('Please upload payment proof before confirming');
            return;
        }
        
        // Show payment pending message
        paymentPending.style.display = 'block';
        paymentSection.style.display = 'none';
        
        // Simulate payment verification process
        setTimeout(function() {
            paymentPending.style.display = 'none';
            paymentSuccess.style.display = 'block';
            
            // Load pickup location from localStorage or use default
            const savedLocation = localStorage.getItem('pickupLocation') || "Room No. 132, Mathura Block";
            const savedAddress = localStorage.getItem('pickupAddress') || "Hostel Building, Amrita Vishwa Vidyapeetham";
            
            pickupLocation.textContent = savedLocation;
            pickupAddress.textContent = savedAddress;
            
            // Set pickup time (current time + 30 minutes)
            const now = new Date();
            now.setMinutes(now.getMinutes() + 30);
            const options = { 
                weekday: 'long', 
                hour: 'numeric', 
                minute: 'numeric',
                hour12: true 
            };
            pickupTime.textContent = now.toLocaleString('en-IN', options);
            
            // Show pickup information
            pickupInfo.style.display = 'block';
            
            // Update request status to completed
            const studentRequest = JSON.parse(localStorage.getItem('currentStudentRequest') || '{}');
            if (studentRequest.name) {
                studentRequest.status = 'completed';
                studentRequest.paymentMethod = selectedPaymentMethod;
                studentRequest.completionTime = new Date().toISOString();
                
                // Save to transaction history
                const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
                transactions.push(studentRequest);
                localStorage.setItem('transactions', JSON.stringify(transactions));
                
                // Clear current request but keep in history
                localStorage.setItem('currentStudentRequest', JSON.stringify({...studentRequest, status: 'archived'}));
            }
            
            // Scroll to success message
            paymentSuccess.scrollIntoView({ behavior: 'smooth' });
        }, 3000);
    });

    // Initialize the application
    initializeCountryCodes();
    
    // Auto-show phone field if student type is already selected (on page reload)
    if (studentTypeSelect.value === 'national' || studentTypeSelect.value === 'international') {
        phoneNumberGroup.style.display = 'block';
    }
});