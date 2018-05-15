const {
  operators: { map },
} = rxjs;

export function handleAjax(property) {
  return obs$ =>
    obs$.pipe(
      map(jsonRes => {
        if (jsonRes.error) {
          if (jsonRes.error.code === "4") {
            // 결과가 존재하지 않는 경우
            return [];
          } else {
            throw jsonRes.error;
          }
        } else {
          const value = jsonRes[property];

          return Array.isArray(value) ? value : [value].filter(_ => _);

          // 이 코드는 value가 배열인 경우 성능이 안좋을 수 있음
          // return [].concat(value).filter(_ => _);
        }
      })
    );
}
