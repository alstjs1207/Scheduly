import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터 설정
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // 서버 응답이 있는 경우
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          console.error('잘못된 요청:', data.message);
          break;
        case 401:
          console.error('인증 실패:', data.message);
          // TODO: 로그인 페이지로 리다이렉트 또는 토큰 갱신
          break;
        case 403:
          console.error('권한 없음:', data.message);
          break;
        case 404:
          console.error('리소스를 찾을 수 없음:', data.message);
          break;
        case 500:
          console.error('서버 오류:', data.message);
          break;
        default:
          console.error('알 수 없는 오류:', data.message);
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      console.error('서버로부터 응답이 없습니다.');
    } else {
      // 요청 자체를 보내지 못한 경우
      console.error('요청 설정 중 오류 발생:', error.message);
    }
    
    return Promise.reject(error);
  }
); 