"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { jsPDF } from "jspdf"; // jsPDF 라이브러리 추가

interface OrderRequest {
  name: string;
  email: string;
  product: string;
  quantity: number;
}

const OrderRequestForm = () => {
  const initialValues: OrderRequest = {
    name: "",
    email: "",
    product: "",
    quantity: 0,
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("이름을 입력하세요."),
    email: Yup.string()
      .email("유효한 이메일 주소를 입력하세요.")
      .required("이메일을 입력하세요."),
    product: Yup.string().required("상품을 선택하세요."),
    quantity: Yup.number()
      .min(1, "수량은 1개 이상이어야 합니다.")
      .required("수량을 입력하세요."),
  });

  const handleSubmit = async (values: OrderRequest) => {
    try {
      // 1. PDF 생성
      const doc = new jsPDF();
      doc.text(`order form kangsters`, 10, 10);
      doc.text(`name: ${values.name}`, 10, 20);
      doc.text(`mail: ${values.email}`, 10, 30);
      doc.text(`product: ${values.product}`, 10, 40);
      doc.text(`count: ${values.quantity}`, 10, 50);
      doc.table(
        10,
        60,
        [
          { product: "wheelyx", count: "1", price: "1000000" },
          { product: "wheelyx play", count: "1", price: "1000000" },
        ],
        ["product", "count", "price"],
        {}
      );
      const pdfBuffer = doc.output("arraybuffer");
      const pdfBlob = new Blob([doc.output("arraybuffer")], {
        type: "application/pdf",
      });

      // 2. PDF 다운로드
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = "order-request.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pdfUrl);

      // 2. API 라우트 호출 (PDF 데이터를 함께 전송)
      const response = await fetch("/api/send-order-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          pdfBuffer: Array.from(new Uint8Array(pdfBuffer)),
        }),
      });

      if (response.ok) {
        alert("이메일 전송 성공!");
      } else {
        alert("이메일 전송 실패.");
      }
    } catch (error) {
      console.error("오류 발생:", error);
      alert("오류가 발생했습니다.");
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <Form className="flex flex-col m-4 gap-4">
        <div>
          <label htmlFor="name">name:</label>
          <Field type="text" id="name" name="name" />
          <ErrorMessage name="name" component="div" />
        </div>
        <div>
          <label htmlFor="email">email:</label>
          <Field type="email" id="email" name="email" />
          <ErrorMessage name="email" component="div" />
        </div>
        <div>
          <label htmlFor="product">product:</label>
          <Field type="text" id="product" name="product" />
          <ErrorMessage name="product" component="div" />
        </div>
        <div>
          <label htmlFor="quantity">count:</label>
          <Field type="number" id="quantity" name="quantity" />
          <ErrorMessage name="quantity" component="div" />
        </div>
        <button type="submit">request order</button>
      </Form>
    </Formik>
  );
};

export default OrderRequestForm;
