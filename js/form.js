import {isEscapeKey} from './util.js';
import {sendPicture} from './api.js';
import {showSuccessMessageForm, showErrorMessageForm} from './message.js';

const inputUpload = document.querySelector('.img-upload__input');
const modalImageEditor = document.querySelector('.img-upload__overlay');
const body = document.querySelector('body');
const modalImageEditorButtonClose = document.querySelector('.img-upload__cancel');
const form = document.querySelector('.img-upload__form');
const comment = form.querySelector('.text__description');
const hashtags = form.querySelector('.text__hashtags');
const imgPreview = document.querySelector('.img-upload__preview');
const effectLevelSliderContainer = document.querySelector('.img-upload__effect-level');
const formSabbmitButton = form.querySelector('.img-upload__submit');
const hashtag = /^#[a-zA-Zа-яёА-ЯЁ0-9]{1,19}$/;
const FormSabbmitButtonCaption = {
  SABBMITING: 'Отправляю...',
  DEFAULT: 'Опубликовать'
};

const getActiveElement = () => document.activeElement === comment ||
  document.activeElement === hashtags;

const isErrorMessageExsits = () => Boolean(document.querySelector('.error'));

const onDocumentKeydown = (evt) => {
  if (isEscapeKey(evt) && !getActiveElement() && !isErrorMessageExsits()) {
    evt.preventDefault();
    body.classList.remove('modal-open');
    modalImageEditor.classList.add('hidden');
    inputUpload.value = null;
    form.reset();
    imgPreview.style = 'none';
  }
};

inputUpload.onchange = () => {
  modalImageEditor.classList.remove('hidden');
  body.classList.add('modal-open');
  effectLevelSliderContainer.classList.add('hidden');
  document.addEventListener('keydown', onDocumentKeydown);
};

const onModalImageEditorButtonCloseClick = () => {
  modalImageEditor.classList.add('hidden');
  body.classList.remove('modal-open');
  inputUpload.value = null;
  form.reset();
  imgPreview.style = 'none';
  document.removeEventListener('keydown', onDocumentKeydown);
};

const pristine = new Pristine(form, {
  classTo: 'img-upload__field-wrapper',
  errorTextParent: 'img-upload__field-wrapper',
  errorClass: 'img-upload__field-wrapper--error'
});

const validateComment = (value) => value.length <= 140;

const turnArrayHashtags = () => hashtags.value.split(' ');

const checksNumberHashtags = () => {
  const arrayHashtags = turnArrayHashtags();
  return arrayHashtags.length <= 5;
};

const checksValidityHashtag = () => {
  if (hashtags.value.length === 0) {
    return true;
  }

  const arrayHashtags = turnArrayHashtags();
  let result = true;
  arrayHashtags.forEach((element) => {
    if (!hashtag.test(element)){
      result = false;
    }
  });

  return result;
};

const checksHashtagsForRepetition = () => {
  const arrayHashtags = turnArrayHashtags();
  const newArrayHashtags = [];
  let boolean = true;

  arrayHashtags.forEach((element) => {
    if (newArrayHashtags.indexOf(element.toLowerCase()) !== -1) {
      boolean = false;
    }
    newArrayHashtags.push(element.toLowerCase());
  });
  return boolean;
};

pristine.addValidator(comment,
  validateComment,
  'Длина комментария больше 140 символов',
  1,
  false
);
pristine.addValidator(hashtags,
  checksNumberHashtags,
  'Превышено количество хэш-тегов',
  3,
  false
);
pristine.addValidator(hashtags,
  checksValidityHashtag,
  'Введён невалидный хэш-тег',
  1,
  false
);
pristine.addValidator(hashtags,
  checksHashtagsForRepetition,
  'Хэш-теги повторяются',
  2,
  false
);

const toggleFormSabbmitButton = (isDisabled) => {
  formSabbmitButton.disabled = isDisabled;

  if (isDisabled) {
    formSabbmitButton.textContent = FormSabbmitButtonCaption.SABBMITING;
  } else {
    formSabbmitButton.textContent = FormSabbmitButtonCaption.DEFAULT;
  }
};

const sentForm = async (formElement) => {
  if (pristine.validate()) {
    try {
      toggleFormSabbmitButton(true);
      await sendPicture(new FormData(formElement));
      toggleFormSabbmitButton(false);
      onModalImageEditorButtonCloseClick();
      showSuccessMessageForm();
    } catch {
      showErrorMessageForm();
      toggleFormSabbmitButton(false);
    }
  }
};

const onFormSabbmit = (evt) => {
  evt.preventDefault();
  sentForm(evt.target);
};

modalImageEditorButtonClose.addEventListener('click', onModalImageEditorButtonCloseClick);
form.addEventListener('submit', onFormSabbmit);

