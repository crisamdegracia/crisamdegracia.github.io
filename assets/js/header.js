window.addEventListener('DOMContentLoaded', function(e){
	const burger = document.querySelector('.js-burger');
	const mobileMenu = document.querySelector('.header__mobile-lists');
	burger.addEventListener('click', function(e){
		mobileMenu.classList.toggle('header__mobile-lists-active');
	})
})

