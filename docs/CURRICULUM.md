# VietWireless Curriculum

Đây là source of truth cho learning graph của VietWireless.

## Nguyên tắc tổ chức

- Đi từ tổng quan tới cụ thể.
- Mỗi phần lớn nên bắt đầu bằng một bài overview giải thích vấn đề hệ thống đang cố giải quyết.
- Chỉ sau khi người đọc có mental model tổng thể mới zoom vào signal, channel, procedure hoặc công thức cụ thể.
- Không mở một chủ đề 5G NR bằng định nghĩa rời rạc kiểu “PSS là gì?” nếu người đọc chưa biết PSS xuất hiện ở bước nào trong hành trình của UE.
- Các bài foundation có thể chạm qua nhiều khái niệm để tạo bản đồ. Những bài sau phải zoom sâu, không viết lại cùng nội dung.
- Internal links phải đi theo learning graph này.

## Trục kể chuyện chính

Information
→ signal
→ sampling
→ amplitude / frequency / phase
→ complex number
→ I/Q
→ Fourier / DFT / FFT
→ modulation
→ RF
→ channel
→ noise / multipath
→ correlation
→ OFDM
→ resource grid
→ 5G numerology
→ UE power on
→ synchronization
→ SSB
→ PSS / SSS
→ PBCH / MIB
→ CORESET#0 / SearchSpace#0
→ PDCCH / SIB1
→ PRACH
→ Timing Advance
→ RRC connection
→ connected-mode PHY
→ receiver impairments
→ NTN.

## Phần I: Nền tảng signal

1. Signal là gì?
2. Sampling, aliasing và Nyquist
3. Amplitude, frequency và phase
4. Số phức và phasor
5. I/Q và complex baseband
6. Miền thời gian và miền tần số
7. Fourier, DFT và FFT
8. Modulation: BPSK → QPSK → QAM

Bài 01 là bản đồ nền tảng. Các bài 02 đến 08 zoom sâu vào từng khái niệm đã được chạm qua.

## Phần II: Từ signal tới wireless link

9. Baseband → RF → antenna
10. Wireless channel
11. Noise, SNR và EVM
12. Multipath và delay spread
13. Correlation
14. OFDM: bức tranh tổng thể
15. IFFT/FFT trong OFDM
16. Cyclic Prefix
17. Resource grid
18. Numerology trong 5G NR

## Phần III: UE bật lên và tìm mạng 5G

19. UE bật nguồn thì chuyện gì xảy ra?
20. Synchronization là gì?
21. SSB là gì?
22. PSS
23. SSS và Physical Cell ID
24. Fine timing và frequency synchronization
25. PBCH DM-RS
26. PBCH
27. MIB

Bài 19 phải là overview. Nó kể toàn bộ flow từ power on tới khi UE đọc được MIB, chưa đi sâu sequence hay bit field.

## Phần IV: Từ MIB tới system information

28. CORESET#0 và SearchSpace#0
29. PDCCH là gì?
30. DCI cơ bản
31. SIB1 nằm ở đâu?
32. SIB1
33. Cell selection và camping

## Phần V: UE bắt đầu nói với gNB

34. Random Access tổng quan
35. PRACH là gì?
36. PRACH preamble
37. SSB ↔ PRACH occasion
38. Random Access Response
39. Timing Advance
40. Msg3 và Msg4
41. RRC Setup

Phải phân biệt rõ:

- Downlink synchronization: UE align receiver của mình với downlink của gNB.
- Uplink timing alignment: gNB đo timing của uplink và dùng Timing Advance để điều chỉnh thời điểm UE phát.

## Phần VI: Truyền data sau khi connected

42. Bức tranh PHY khi UE đã connected
43. PDSCH
44. PUSCH
45. PUCCH
46. DMRS
47. Channel estimation
48. Equalization
49. HARQ
50. MCS và link adaptation
51. MIMO và beamforming

## Phần VII: Receiver thực tế

52. Timing offset
53. Carrier Frequency Offset
54. CFO estimation và correction
55. Sampling Frequency Offset
56. Phase noise
57. EVM

## Phần VIII: 5G NTN

58. Từ terrestrial NR tới NTN
59. Propagation delay
60. Doppler trong NTN
61. NTN synchronization
62. NTN Timing Advance
63. SIB19
64. Ephemeris và satellite position
65. NTN Random Access
66. Moving satellite, beam và handover

## Template cho một phần mới

Khi bắt đầu một phần lớn:

1. Viết bài overview trước.
2. Đặt một flow end-to-end hoặc state progression ở đầu bài.
3. Giải thích vấn đề trước khi giới thiệu tên channel/signal/procedure.
4. Chỉ ra input mà receiver đang có và điều nó chưa biết.
5. Sau đó mới tách thành các bài chuyên sâu.
6. Mỗi bài chuyên sâu phải link ngược về overview và link tới bước tiếp theo.
7. Khi liên quan 3GPP, thêm specification layer theo `docs/CONTENT_GUIDELINES.md`.

## Ưu tiên triển khai tiếp

Thứ tự ưu tiên gần nhất:

1. Sampling, aliasing và Nyquist.
2. Amplitude, frequency và phase.
3. Số phức, phasor và I/Q.
4. Fourier / DFT / FFT.
5. Modulation.
6. OFDM overview và resource grid.
7. 5G numerology.
8. UE bật nguồn thì chuyện gì xảy ra?
9. Synchronization.
10. SSB → PSS → SSS → PBCH → MIB.

Không nên bỏ qua các foundation chỉ để tới 5G sớm hơn. Tuy nhiên overview 5G initial access có thể xuất hiện trước để người đọc biết các kiến thức nền tảng sau này sẽ được dùng ở đâu.
