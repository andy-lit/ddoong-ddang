import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { to, content } = await request.json();

    // 환경변수 확인
    const apiKey = process.env.ALIGO_API_KEY;
    const userId = process.env.ALIGO_USER_ID;
    const senderPhone = process.env.SENDER_PHONE?.replace(/-/g, "");

    // 환경변수 유효성 검사
    if (!apiKey || !userId || !senderPhone) {
      console.error("Missing environment variables:", {
        apiKey: !!apiKey,
        userId: !!userId,
        senderPhone: !!senderPhone,
      });
      throw new Error("환경변수 설정이 누락되었습니다.");
    }

    // 수신번호에서 하이픈 제거
    const cleanedPhoneNumber = to.replace(/-/g, "");

    // API 요청 데이터 로깅
    console.log("SMS Request Data:", {
      to: cleanedPhoneNumber,
      from: senderPhone,
      content: content.substring(0, 20) + "...", // 내용 일부만 로깅
    });

    const response = await fetch("https://apis.aligo.in/send/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        key: apiKey,
        user_id: userId,
        sender: senderPhone,
        receiver: cleanedPhoneNumber,
        msg: content,
        // testmode_yn: "Y" // 테스트 모드 활성화시 주석 해제
      }).toString(),
    });

    // API 응답 로깅
    const responseData = await response.json();
    console.log("SMS API Response:", responseData);

    if (responseData.result_code !== 1) {
      throw new Error(`SMS API Error: ${responseData.message}`);
    }

    return NextResponse.json({ success: true, result: responseData });
  } catch (error) {
    console.error("SMS 발송 중 상세 오류:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "SMS 발송에 실패했습니다",
      },
      { status: 500 }
    );
  }
}
