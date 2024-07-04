document.addEventListener("DOMContentLoaded", function () {
  const $mainContainer = document.querySelector("#main-container");
  const $bg = document.querySelector("#bg");
  const $bgm1 = document.querySelector("#bgm1");
  const $bgm2 = document.querySelector("#bgm2");
  const $bgm3 = document.querySelector("#bgm3");
  const $bgm4 = document.querySelector("#bgm4");
  const $bgm5 = document.querySelector("#bgm5");
  const $sound = document.querySelector("#sound");
  const $result = document.querySelector("#result");
  const $team = document.querySelector("#team");
  const ctx = $result.getContext("2d");
  const $mask = document.querySelector("#mask")
  const $cutscene = document.querySelector("#cutscene");
  const $cutsceneBg = document.querySelector("#cutscene-bg");
  const $text1 = document.querySelector("#text1");
  const $text2 = document.querySelector("#text2");
  const $inputContainer = document.querySelector("#input-container");
  const $inputBox = document.querySelector("#input-box");
  const $bar = document.querySelector("#bar");
  const $btn1 = document.querySelector("#btn1");
  const $btn2 = document.querySelector("#btn2");
  const $btn3 = document.querySelector("#btn3");
  const $btn4 = document.querySelector("#btn4");
  const $btn5 = document.querySelector("#btn5");
  const $btn6 = document.querySelector("#btn6");
  const $btn7 = document.querySelector("#btn7");
  const $btn8 = document.querySelector("#btn8");
  const $questionOpContainer = document.querySelector("#question-op-container");
  const $questionFrame = document.querySelector("#question-frame");
  const $questionText = document.querySelector("#question-text");
  const $opBtn1 = document.querySelector("#op-btn1");
  const $opBtn2 = document.querySelector("#op-btn2");
  const $opBtn3 = document.querySelector("#op-btn3");
  const $opBtn4 = document.querySelector("#op-btn4");
  const $opFrame1 = document.querySelector("#op-frame1");
  const $opFrame2 = document.querySelector("#op-frame2");
  const $opFrame3 = document.querySelector("#op-frame3");
  const $opFrame4 = document.querySelector("#op-frame4");
  const $opText1 = document.querySelector("#op-text1");
  const $opText2 = document.querySelector("#op-text2");
  const $opText3 = document.querySelector("#op-text3");
  const $opText4 = document.querySelector("#op-text4");

  let isMuted = false;
  let currentQuestion = 0;
  let username;
  let character;
  let team;
  let handleVideoEndedWrapper;

  let questions;
  const options = [];

  const attributes = {
    adventure: 0,
    social: 0,
    creativity: 0,
    strategy: 0,
    emotion: 0,
    intuition: 0
  };

  const CharacterNames = ["健力龍蝦", "海馬騎士", "鼓手海葵", "RAP河豚", "後搖海豚", "DJ章魚"]

  const debounce = (func, delay) => {
    let debounceTimer;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    }
  }

  async function fetchQuestions() {
    const response = await fetch("/api/question");
    const data = await response.json();
    questions = data;
  }

  async function fetchBlueRatio() {
    const response = await fetch("/api/blue-ratio");
    const data = await response.json();
    return data.blueRatio;
  }

  async function generateCharacter(attributes) {
    const attributeToCode = {
      adventure: 1,
      social: 2,
      creativity: 3,
      strategy: 4,
      emotion: 5,
      intuition: 6
    };

    const tempAttr = { ...attributes };

    const blueRatio = await fetchBlueRatio();

    if (blueRatio > 0.6) {
      tempAttr.social = -1;
      tempAttr.creativity = -1;
      tempAttr.intuition = -1;
    } else if (blueRatio < 0.4) {
      tempAttr.adventure = -1;
      tempAttr.strategy = -1;
      tempAttr.emotion = -1;
    }

    const max_value = Math.max(...Object.values(tempAttr));
    const highest_attributes = Object.keys(tempAttr).filter(attr => tempAttr[attr] === max_value);
    const selected_attribute = highest_attributes[Math.floor(Math.random() * highest_attributes.length)];
    const characterCode = attributeToCode[selected_attribute];

    return characterCode;
  }

  function toggleVisibility(element) {
    element.classList.toggle("hidden");
  }

  function toggleMute() {
    if (isMuted) {
      $bgm1.muted = false;
      $sound.src = "/media/game/sound1.png";
      $bgm2.muted = false;
      $bgm3.muted = false;
      $bgm4.muted = false;
      $bgm5.muted = false;
      isMuted = false;
    } else {
      $bgm1.muted = true;
      $sound.src = "/media/game/sound2.png";
      $bgm2.muted = true;
      $bgm3.muted = true;
      $bgm4.muted = true;
      $bgm5.muted = true;
      isMuted = true;
    }
  }

  const debounceToggleMute = debounce(toggleMute, 300);

  function toNextPage(callback) {
    function handleFirstAnimationEndWrapper() {
      $cutsceneBg.removeEventListener("animationend", handleFirstAnimationEndWrapper);
      $cutsceneBg.addEventListener("animationend", handleSecondAnimationEndWrapper);
      $cutsceneBg.classList.toggle("fadeInToBlack");
      $cutsceneBg.classList.toggle("fadeOutFromBlack");

      callback();
    }

    function handleSecondAnimationEndWrapper() {
      $cutsceneBg.removeEventListener("animationend", handleSecondAnimationEndWrapper);
      $cutsceneBg.classList.toggle("fadeOutFromBlack");
      toggleVisibility($cutscene);
    }

    $cutsceneBg.addEventListener("animationend", handleFirstAnimationEndWrapper);
    $cutsceneBg.classList.toggle("fadeInToBlack");
    toggleVisibility($cutscene);
    $bgm3.play();
  }

  function fn1() {
    toNextPage(() => {
      $bg.src = "/media/game/bg2.mp4";
      toggleVisibility($text1);
      toggleVisibility($btn1);
      toggleVisibility($sound);
      toggleVisibility($text2);
      toggleVisibility($inputContainer);
      toggleVisibility($btn2);
      $inputBox.style.fontSize = `${$mainContainer.offsetWidth / 18}px`;
    });
  }

  function fn2() {
    username = $inputBox.value;
    if (username) {
      toNextPage(() => {
        $bg.src = "/media/game/bg3.mp4";
        $bg.loop = false;
        toggleVisibility($text2);
        toggleVisibility($inputContainer);
        toggleVisibility($btn7);
        toggleVisibility($btn2);
        $btn7.style.fontSize = `${$mainContainer.offsetWidth / 12}px`;

        handleVideoEndedWrapper = function () {
          fn3();
        };

        $bg.addEventListener("ended", handleVideoEndedWrapper);
      });
    }
  }

  function fn3() {
    toNextPage(() => {
      $bg.removeEventListener("ended", handleVideoEndedWrapper);

      if (handleVideoEndedWrapper) {
        $bg.removeEventListener("ended", handleVideoEndedWrapper);
      }

      $bg.src = "/media/game/bg4.mp4";
      $bg.loop = true;
      toggleVisibility($mask);
      toggleVisibility($btn7);
      toggleVisibility($bar);

      $questionText.innerText = questions[0].question;
      $opText1.innerText = questions[0].options[0].text;
      $opText2.innerText = questions[0].options[1].text;
      $opText3.innerText = questions[0].options[2].text;
      $questionOpContainer.classList.toggle("question-container-layout1");
      toggleVisibility($questionOpContainer);
      $questionFrame.style.height = `${$mainContainer.offsetWidth / 3}px`;
      $questionText.style.fontSize = `${$mainContainer.offsetWidth / 24}px`;
      $opFrame1.style.height = `${$mainContainer.offsetWidth * 2.5 / 27}px`;
      $opFrame2.style.height = `${$mainContainer.offsetWidth * 2.5 / 27}px`;
      $opFrame3.style.height = `${$mainContainer.offsetWidth * 2.5 / 27}px`;
      $opFrame4.style.height = `${$mainContainer.offsetWidth * 2.5 / 27}px`;
      $opText1.style.fontSize = `${$mainContainer.offsetWidth / 27}px`;
      $opText2.style.fontSize = `${$mainContainer.offsetWidth / 27}px`;
      $opText3.style.fontSize = `${$mainContainer.offsetWidth / 27}px`;
      $opText4.style.fontSize = `${$mainContainer.offsetWidth / 27}px`;
    });
  }

  function nextQuestion(option) {
    options.push(option + 1);

    toNextPage(() => {
      $opBtn4.classList.add("hidden");

      const { effect } = questions[currentQuestion].options[option];
      attributes[effect]++;
      currentQuestion++;
      $bg.src = `/media/game/bg${currentQuestion + 4}.mp4`;

      if (currentQuestion < 8) {
        $questionText.innerText = questions[currentQuestion].question;
        $opText1.innerText = questions[currentQuestion].options[0].text;
        $opText2.innerText = questions[currentQuestion].options[1].text;
        $opText3.innerText = questions[currentQuestion].options[2].text;
        $bar.src = `/media/game/bar${currentQuestion + 1}.png`;
      } else {
        toggleVisibility($mask);
        toggleVisibility($questionOpContainer);
        toggleVisibility($bar);
        $bgm1.pause();
        toggleVisibility($sound);

        toggleVisibility($btn3);
        $bgm4.play();
      }

      if (currentQuestion === 4) {
        $opText4.innerText = questions[currentQuestion].options[3].text;
        $opBtn4.classList.remove("hidden");
      }

      if (currentQuestion === 1 | currentQuestion === 5) {
        $mask.src = "/media/game/mask2.png";
        $questionOpContainer.classList.toggle("question-container-layout1");
        $questionOpContainer.classList.toggle("question-container-layout2");
        $bar.classList.toggle("bar-layout1");
        $bar.classList.toggle("bar-layout2");
      }
      if (currentQuestion === 2 | currentQuestion === 6) {
        $mask.src = "/media/game/mask1.png";
        $questionOpContainer.classList.toggle("question-container-layout1");
        $questionOpContainer.classList.toggle("question-container-layout2");
        $bar.classList.toggle("bar-layout1");
        $bar.classList.toggle("bar-layout2");
      }
    });
  }

  async function fn4() {
    $btn3.removeEventListener("click", fn4);

    const characterCode = await generateCharacter(attributes);
    character = CharacterNames[characterCode - 1];

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      ctx.font = "54px Cubic";
      ctx.fillStyle = "rgb(92, 53, 3)";
      ctx.textAlign = "center";

      ctx.fillText(username, 540, 90);
    };

    $result.width = 1080;
    $result.height = 1920;
    img.src = `/media/game/result${characterCode}.png`;

    if ([2, 3, 6].includes(characterCode)) {
      team = "blue";
      $team.src = "/media/game/team1.png";
    } else {
      team = "yellow";
      $team.src = "/media/game/team2.png";
    }

    const data = {
      username,
      options,
      attributes,
      character,
      team
    }

    postData(data);

    toNextPage(() => {
      $bgm4.pause();
      toggleVisibility($bg);
      toggleVisibility($result);
      toggleVisibility($team);
      toggleVisibility($btn3);
      toggleVisibility($btn4);
      toggleVisibility($btn5);
      toggleVisibility($btn6);
      toggleVisibility($btn8);
    });
  }

  function setBgAsBottomLayer() {
    $bg.classList.add("bg");
    $bg.removeEventListener("play", setBgAsBottomLayer);
  }

  function shareImage() {
    const dataURL = $result.toDataURL("image/png");

    function dataURLtoBlob(dataurl) {
      let arr = dataurl.split(","), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    }

    const blob = dataURLtoBlob(dataURL);

    const file = new File([blob], "result.png", { type: "image/png" });

    if (navigator.share) {
      navigator.share({
        files: [file]
      })
    }
  }

  const debounceShareImage = debounce(shareImage, 300)

  async function postData(data) {
    await fetch("/api/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
  }

  $bg.addEventListener("play", setBgAsBottomLayer);
  $sound.addEventListener("click", debounceToggleMute);
  $btn7.addEventListener("click", () => {
    fn3();
  });
  $btn1.addEventListener("click", () => {
    $bgm1.play();
    $bgm2.play();
    $bgm2.onplay = () => {
      $bgm2.onplay = "";
      fn1();
    };
  });
  $btn2.addEventListener("click", () => {
    $bgm2.play();
    $bgm2.onplay = () => {
      $bgm2.onplay = "";
      fn2();
    };
  });
  $btn3.addEventListener("click", () => {
    $bgm5.play();
    $bgm5.onplay = () => {
      $bgm5.onplay = "";
      fn4();
    };
  });
  $btn4.addEventListener("click", () => {
    $bgm2.play();
    $bgm2.onended = () => {
      $bgm2.onended = "";
      window.location.reload();
    };
  });
  $btn5.addEventListener("click", () => {
    $bgm2.play();
    $bgm2.onplay = () => {
      $bgm2.onplay = "";
      debounceShareImage();
    };
  });
  $btn6.addEventListener("click", () => {
    $bgm2.play();
    $bgm2.onplay = () => {
      $bgm2.onplay = "";
      toggleVisibility($team);
      toggleVisibility($btn6);
    };
  });
  $opBtn1.addEventListener("click", () => nextQuestion(0));
  $opBtn2.addEventListener("click", () => nextQuestion(1));
  $opBtn3.addEventListener("click", () => nextQuestion(2));
  $opBtn4.addEventListener("click", () => nextQuestion(3));
  window.addEventListener("resize", () => {
    $bg.style.height = `${$bg.offsetWidth * 16 / 9}px`;
    $inputBox.style.fontSize = `${$mainContainer.offsetWidth / 18}px`;
    $questionFrame.style.height = `${$mainContainer.offsetWidth / 3}px`;
    $questionText.style.fontSize = `${$mainContainer.offsetWidth / 24}px`;
    $btn7.style.fontSize = `${$mainContainer.offsetWidth / 12}px`;
    $opFrame1.style.height = `${$mainContainer.offsetWidth * 2.5 / 27}px`;
    $opFrame2.style.height = `${$mainContainer.offsetWidth * 2.5 / 27}px`;
    $opFrame3.style.height = `${$mainContainer.offsetWidth * 2.5 / 27}px`;
    $opFrame4.style.height = `${$mainContainer.offsetWidth * 2.5 / 27}px`;
    $opText1.style.fontSize = `${$mainContainer.offsetWidth / 27}px`;
    $opText2.style.fontSize = `${$mainContainer.offsetWidth / 27}px`;
    $opText3.style.fontSize = `${$mainContainer.offsetWidth / 27}px`;
    $opText4.style.fontSize = `${$mainContainer.offsetWidth / 27}px`;
  });

  $bgm3.volume = 0.5;
  $bg.style.height = `${$bg.offsetWidth * 16 / 9}px`;
  $bg.style.visibility = "visible";
  toggleVisibility($text1);
  toggleVisibility($btn1);
  $result.width = "300px";
  $result.height = "150px";
  fetchQuestions();
});
