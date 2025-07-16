import mongoose from 'mongoose';

export const getMockList = () => {
  const maxLength = 3650;
  const list = [];
  let dateCnt = 0;

  const getMockClink = (index: number) => {
    const random = Math.random(); //- 0과 1 사이의 랜덤 값 생성
    const date = new Date(); // 처음에 25.7.12
    if (random <= 0.5) {
      //- 30% 확률로만 날짜 감소
      dateCnt++; // 이떄 1씩 증가하고
      date.setDate(date.getDate() - dateCnt); //- 날짜를 하루씩 감소 25.7.12 에서 -dateCnt만큼 감소
    }

    let totalScore = (Math.floor(index * 2) + index) * 0.01;

    const imgCnt = Math.floor(Math.random() * 4);
    const imgList = [];
    for (let i = 0; i < imgCnt; i++) {
      imgList.push(
        `https://fastly.picsum.photos/id/410/200/300.jpg?hmac=c8g8PTUISEdRZEqZGLtB3eOCOq7t5A5rJY1vU8dp_Ds`,
      );
    }

    const verseCnt = Math.floor(Math.random() * 4);
    const verseList = [];
    for (let i = 0; i < verseCnt; i++) {
      verseList.push(`SAEHAN-GEN-1@:${i + 1}`);
    }

    return {
      ownerId: new mongoose.Types.ObjectId('68721fa9026516a6875e05f7'),
      content: `${index} 입니다.`,
      imgList,
      verses: verseList,
      likeCount: index,
      commentCount: index,
      createdAt: date,
      updatedAt: date,
      totalScore,
    };
  };

  for (let i = 0; i < maxLength; i++) {
    list.push(getMockClink(i));
  }
  return list;
};
