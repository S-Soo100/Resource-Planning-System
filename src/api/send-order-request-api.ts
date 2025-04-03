import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { name, email, product, quantity, pdfBuffer } = req.body;

    try {
      // Nodemailer 설정 (본인의 이메일 서비스에 맞게 설정)
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "bss.rol20gmail.com", // 환경 변수로 설정
          pass: "song8130**", // 환경 변수로 설정
        },
      });

      const mailOptions = {
        from: "bss.rol20gmail.com",
        to: "arthur@kang-sters.com", // 수신자 이메일 주소
        subject: "주문 요청서",
        text: "주문 요청서가 첨부되었습니다.",
        attachments: [
          {
            filename: "order-request.pdf",
            content: Buffer.from(pdfBuffer),
          },
        ],
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "이메일 전송 성공" });
    } catch (error) {
      console.log("이메일 전송 오류:", error);
      res.status(500).json({ message: "이메일 전송 실패" });
    }
  } else {
    res.status(405).json({ message: "허용되지 않은 메소드" });
  }
}
