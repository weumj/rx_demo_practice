const suite = (name, fn) => {
  console.group(name);
  fn();
  console.groupEnd();
};

suite("constructor", () => {
  const { Observable } = rxjs;
  const numbers$ = new Observable(observer => {
    observer.next(1);
    observer.next(2);
    observer.next(3);
  });
  numbers$.subscribe(v => console.log(v));
});

suite("#create", () => {
  const { Observable } = rxjs;
  const numbers$ = Observable.create(observer => {
    observer.next(1);
    observer.next(2);
    observer.next(3);
  });
  numbers$.subscribe(v => console.log(v));
});

suite("error", () => {
  const { Observable } = rxjs;
  const numbers$ = new Observable(function subscribe(observer) {
    try {
      observer.next(1);
      observer.next(2);
      // 에러가 발생한다면?
      throw new Error("데이터 전달 도중 에러가 발생했습니다");
      observer.next(3);
    } catch (e) {
      observer.error(e);
    }
  });
  numbers$.subscribe({
    next: v => console.log(v),
    error: e => console.error(e),
  });
});

suite("complete", () => {
  const { Observable } = rxjs;
  const numbers$ = new Observable(observer => {
    try {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.complete();
    } catch (e) {
      observer.error(e);
    }
  });
  numbers$.subscribe({
    next: v => console.log(v),
    error: e => console.error(e),
    complete: () => console.log("데이터 전달 완료"),
  });
});

// suite("unsubscribe", () => {
//   const { Observable } = rxjs;
//   const interval$ = new Observable(observer => {
//     const id = setInterval(() => {
//       observer.next(new Date().toString());
//     }, 1000);
//     return () => {
//       // 자원을 해제하는 함수
//       console.log("interval 제거");
//       clearInterval(id);
//     };
//   });
//   const subscription = interval$.subscribe(v => console.log(v));
//
//   // 5초 후 구독을 해제한다.
//   setTimeout(function() {
//     subscription.unsubscribe();
//   }, 5000);
// });

suite("from - promise", () => {
  const { from } = rxjs;
  const success$ = from(Promise.resolve(100));
  success$.subscribe({
    next: v => console.log(v),
    error: e => console.log(e),
    complete: () => console.log("완료"),
  });
  // 100
  // "완료"

  const fail$ = from(Promise.reject("에러"));
  fail$.subscribe({
    next: v => console.log(v),
    error: e => console.log(e),
    complete: () => console.log("완료"),
  });
  // "에러"
});
