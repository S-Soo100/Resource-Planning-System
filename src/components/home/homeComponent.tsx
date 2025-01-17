import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";

const HomeComponent = () => {
  return null; // 이 페이지는 실제로 렌더링되지 않음 (리다이렉션만 수행)
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = parseCookies(context);
  const isLoggedIn = cookies.token; // `token` 쿠키가 존재하면 로그인 상태로 간주

  if (isLoggedIn) {
    alert("no token");
    return {
      redirect: {
        destination: "/menu", // 로그인 상태라면 메뉴 페이지로 이동
        permanent: false,
      },
    };
  }

  alert("have token");
  return {
    redirect: {
      destination: "/signin", // 로그인 상태가 아니라면 로그인 페이지로 이동
      permanent: false,
    },
  };
};

export default HomeComponent;
