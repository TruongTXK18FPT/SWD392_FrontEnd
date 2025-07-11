
export interface Seminar {
  id: number;
  title: string;
  description: string;
  duration: number;
  price: number;
  slot: number;
  imageUrl: string;
  meetingUrl: string;
  formUrl: string;
  status: 'PENDING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  statusApprove: 'PENDING' | 'APPROVED' | 'REJECTED'; 
  createBy: number; 






}
